import pytest

from app.services import github_service
from app.services.github_service import GitHubError, RepoRef, _build_diff, parse_repo_url


def test_parse_repo_url_accepts_standard_form():
    ref = parse_repo_url("https://github.com/JOSHODIN2019/odin-recipes")
    assert ref.owner == "JOSHODIN2019"
    assert ref.repo == "odin-recipes"


def test_parse_repo_url_accepts_trailing_slash_and_dot_git():
    assert parse_repo_url("https://github.com/octocat/Hello-World/").repo == "Hello-World"
    assert parse_repo_url("https://github.com/octocat/Hello-World.git").repo == "Hello-World"


def test_parse_repo_url_rejects_non_github_url():
    with pytest.raises(GitHubError) as exc_info:
        parse_repo_url("https://gitlab.com/owner/repo")
    assert exc_info.value.status_code == 422


def test_parse_repo_url_rejects_garbage():
    with pytest.raises(GitHubError):
        parse_repo_url("not a url at all")


def test_build_diff_includes_patch_when_available():
    files = [{"filename": "a.py", "status": "modified", "additions": 1, "deletions": 1, "patch": "-old\n+new"}]
    diff, changed_files = _build_diff(files)
    assert changed_files == ["a.py"]
    assert "-old" in diff and "+new" in diff


def test_build_diff_handles_missing_patch_gracefully():
    files = [{"filename": "image.png", "status": "modified", "additions": 0, "deletions": 0}]
    diff, changed_files = _build_diff(files)
    assert changed_files == ["image.png"]
    assert "Diff unavailable" in diff


def test_build_diff_truncates_oversized_patch():
    huge_patch = "+line\n" * 5000  # comfortably over MAX_DIFF_CHARS
    files = [{"filename": "big.py", "status": "modified", "additions": 5000, "deletions": 0, "patch": huge_patch}]
    diff, _ = _build_diff(files)
    assert len(diff) < len(huge_patch)
    assert "truncated" in diff


class FakeResponse:
    def __init__(self, json_data, headers=None):
        self._json_data = json_data
        self.headers = headers or {}

    def json(self):
        return self._json_data


async def test_list_commits_parses_summaries_and_pagination(monkeypatch):
    fake_data = [
        {
            "sha": "abc123",
            "commit": {"message": "Fix bug\n\nlonger body", "author": {"name": "Jane", "date": "2026-01-01T00:00:00Z"}},
            "author": {"login": "jane"},
        }
    ]

    async def fake_get(path, params=None):
        assert "/commits" in path
        return FakeResponse(fake_data, headers={"link": '<...>; rel="next"'})

    monkeypatch.setattr(github_service, "_get", fake_get)

    commits, has_more = await github_service.list_commits(RepoRef(owner="o", repo="r"), page=1)
    assert len(commits) == 1
    assert commits[0].sha == "abc123"
    assert commits[0].message == "Fix bug"  # first line only
    assert commits[0].author == "Jane"
    assert has_more is True


async def test_list_commits_no_next_page(monkeypatch):
    async def fake_get(path, params=None):
        return FakeResponse([], headers={})

    monkeypatch.setattr(github_service, "_get", fake_get)
    commits, has_more = await github_service.list_commits(RepoRef(owner="o", repo="r"), page=2)
    assert commits == []
    assert has_more is False


async def test_get_commit_builds_full_detail(monkeypatch):
    fake_data = {
        "sha": "deadbeef",
        "commit": {"message": "Add feature X", "author": {"name": "Jane", "date": "2026-01-01T00:00:00Z"}},
        "author": {"login": "jane"},
        "files": [{"filename": "x.py", "status": "added", "additions": 10, "deletions": 0, "patch": "+new file"}],
        "stats": {"additions": 10, "deletions": 0},
    }

    async def fake_get(path):
        assert "/commits/deadbeef" in path
        return FakeResponse(fake_data)

    monkeypatch.setattr(github_service, "_get", fake_get)

    commit = await github_service.get_commit(RepoRef(owner="o", repo="r"), "deadbeef")
    assert commit.sha == "deadbeef"
    assert commit.message == "Add feature X"
    assert commit.changed_files == ["x.py"]
    assert commit.additions == 10
