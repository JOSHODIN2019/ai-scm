import pytest

from app.models.enums import ChangeType, RiskLevel
from app.services import ai_service
from app.services.ai_service import analyze_change


@pytest.fixture(autouse=True)
def force_mock_mode(monkeypatch):
    # `ai_service.settings` is a module-level Settings instance bound at
    # import time, so patching env vars has no effect on it -- patch the
    # instance attribute directly. This keeps the test suite free and
    # offline: it must never make a real (billed) OpenAI call.
    monkeypatch.setattr(ai_service.settings, "use_mock_ai", True)


async def test_bug_fix_keyword_is_classified_as_bug_fix():
    result = await analyze_change("fix crash on null pointer", ["app/handler.py"], "- bug\n+ fix")
    assert result.change_type == ChangeType.BUG_FIX
    assert result.is_mock is True


async def test_config_file_is_classified_as_configuration_change():
    result = await analyze_change("update settings", [".env", "docker-compose.yml"], "")
    assert result.change_type == ChangeType.CONFIGURATION_CHANGE


async def test_auth_related_change_gets_elevated_risk():
    result = await analyze_change(
        "add new session handling", ["auth/session.py", "auth/login.py"], "+ token = generate()"
    )
    assert result.risk_level in (RiskLevel.MEDIUM, RiskLevel.HIGH)
    assert "authentication" in result.explanation.lower() or "security" in result.explanation.lower()


async def test_small_unremarkable_change_gets_low_risk():
    result = await analyze_change("update button label copy", ["ui/Button.tsx"], "- Submit\n+ Send")
    assert result.risk_level == RiskLevel.LOW


async def test_mock_explanation_never_claims_to_be_real_model():
    result = await analyze_change("refactor helper function", ["utils.py"], "")
    assert result.is_mock is True
    assert "mock" in result.explanation.lower()
