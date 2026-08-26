"""End-to-end tests against the real FastAPI app + local MongoDB.

Runs against the local dev database (see backend/.env, MONGODB_URI) --
requires `brew services start mongodb/brew/mongodb-community@7.0` to be
running. Every test uses a unique throwaway email and cleans up its own
data, so it's safe to run against a database that also holds real/demo
data.
"""

import uuid

import httpx
import pytest

from app.database.mongo import close_client, get_database
from app.main import app
from app.services import ai_service


@pytest.fixture(autouse=True)
def force_mock_mode(monkeypatch):
    # Never spend real money / hit the network from the test suite.
    monkeypatch.setattr(ai_service.settings, "use_mock_ai", True)


@pytest.fixture(autouse=True)
async def fresh_motor_client_per_test():
    # pytest-asyncio gives each test function its own event loop, but the
    # Motor client in app/database/mongo.py is a process-global cached on
    # first use -- reusing it across tests binds it to a closed loop and
    # raises "Event loop is closed". Reset it so each test lazily creates
    # its own client bound to its own loop (harmless in production, where
    # there's only ever one loop for the process's lifetime).
    close_client()
    yield
    close_client()


@pytest.fixture
async def client():
    transport = httpx.ASGITransport(app=app)
    async with httpx.AsyncClient(transport=transport, base_url="http://test") as c:
        yield c


@pytest.fixture
async def cleanup_users():
    created_emails: list[str] = []
    yield created_emails
    db = get_database()
    for email in created_emails:
        user = await db.users.find_one({"email": email})
        if not user:
            continue
        user_id = str(user["_id"])

        # Cascade the same way DELETE /api/projects/{id} does, so a test
        # that creates a project (or more) without deleting it doesn't
        # leave orphaned changes/analyses behind.
        project_ids = [
            str(doc["_id"]) async for doc in db.projects.find({"user_id": user_id}, {"_id": 1})
        ]
        if project_ids:
            change_ids = [
                str(doc["_id"])
                async for doc in db.software_changes.find(
                    {"project_id": {"$in": project_ids}}, {"_id": 1}
                )
            ]
            if change_ids:
                await db.analysis_results.delete_many({"change_id": {"$in": change_ids}})
                await db.software_changes.delete_many({"project_id": {"$in": project_ids}})
            await db.projects.delete_many({"user_id": user_id})

        await db.users.delete_one({"_id": user["_id"]})


def unique_email() -> str:
    return f"pytest_{uuid.uuid4().hex[:12]}@example.com"


async def test_register_login_and_me(client, cleanup_users):
    email = unique_email()
    cleanup_users.append(email)

    res = await client.post(
        "/api/auth/register",
        json={"full_name": "Test User", "email": email, "password": "password123"},
    )
    assert res.status_code == 201
    token = res.json()["access_token"]

    res = await client.post("/api/auth/login", json={"email": email, "password": "password123"})
    assert res.status_code == 200

    res = await client.get("/api/auth/me", headers={"Authorization": f"Bearer {token}"})
    assert res.status_code == 200
    assert res.json()["email"] == email


async def test_duplicate_registration_is_rejected(client, cleanup_users):
    email = unique_email()
    cleanup_users.append(email)
    payload = {"full_name": "Dup", "email": email, "password": "password123"}

    res = await client.post("/api/auth/register", json=payload)
    assert res.status_code == 201

    res = await client.post("/api/auth/register", json=payload)
    assert res.status_code == 409


async def test_login_with_wrong_password_is_rejected(client, cleanup_users):
    email = unique_email()
    cleanup_users.append(email)
    await client.post(
        "/api/auth/register",
        json={"full_name": "Test", "email": email, "password": "password123"},
    )
    res = await client.post("/api/auth/login", json={"email": email, "password": "wrong-password"})
    assert res.status_code == 401


async def test_unauthenticated_request_is_rejected(client):
    res = await client.get("/api/projects")
    assert res.status_code == 401


async def test_cannot_access_another_users_project(client, cleanup_users):
    email_a, email_b = unique_email(), unique_email()
    cleanup_users += [email_a, email_b]

    res_a = await client.post(
        "/api/auth/register", json={"full_name": "A", "email": email_a, "password": "password123"}
    )
    token_a = res_a.json()["access_token"]
    res_b = await client.post(
        "/api/auth/register", json={"full_name": "B", "email": email_b, "password": "password123"}
    )
    token_b = res_b.json()["access_token"]

    res = await client.post(
        "/api/projects",
        json={"project_name": "A's project"},
        headers={"Authorization": f"Bearer {token_a}"},
    )
    project_id = res.json()["id"]

    res = await client.get(
        f"/api/projects/{project_id}", headers={"Authorization": f"Bearer {token_b}"}
    )
    assert res.status_code == 404


async def test_full_flow_and_cascade_delete_cleans_up_orphans(client, cleanup_users):
    email = unique_email()
    cleanup_users.append(email)
    db = get_database()

    res = await client.post(
        "/api/auth/register", json={"full_name": "Flow", "email": email, "password": "password123"}
    )
    token = res.json()["access_token"]
    headers = {"Authorization": f"Bearer {token}"}

    res = await client.post("/api/projects", json={"project_name": "Flow Project"}, headers=headers)
    assert res.status_code == 201
    project_id = res.json()["id"]

    res = await client.post(
        f"/api/projects/{project_id}/changes",
        json={
            "commit_id": "c1",
            "commit_message": "fix null pointer crash",
            "author": "tester",
            "changed_files": ["a.py"],
            "code_diff": "- bug\n+ fix",
            "commit_date": "2026-01-01",
        },
        headers=headers,
    )
    assert res.status_code == 201
    change_id = res.json()["id"]

    res = await client.post(f"/api/changes/{change_id}/analyze", headers=headers)
    assert res.status_code == 201
    analysis = res.json()
    assert analysis["is_mock"] is True

    # Sanity check the documents actually exist before deleting.
    assert await db.software_changes.count_documents({"project_id": project_id}) == 1
    assert await db.analysis_results.count_documents({"change_id": change_id}) == 1

    res = await client.delete(f"/api/projects/{project_id}", headers=headers)
    assert res.status_code == 204

    # Cascade delete must remove the whole chain -- no orphaned documents.
    assert await db.software_changes.count_documents({"project_id": project_id}) == 0
    assert await db.analysis_results.count_documents({"change_id": change_id}) == 0
