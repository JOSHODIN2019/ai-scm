"""AI analysis service.

Isolates OpenAI-specific integration behind analyze_change() so the rest of
the application never depends on OpenAI implementation details. Falls back
to a clearly-marked mock analyzer (heuristic, not an LLM) whenever
USE_MOCK_AI is set or no API key is configured, per PROJECT_MEMORY.md
Section 6.
"""

from dataclasses import dataclass

from app.core.config import get_settings
from app.models.enums import ChangeType, RiskLevel

settings = get_settings()

SYSTEM_PROMPT = """You are a software configuration management assistant.

Analyze the following software change.

Commit message:
{commit_message}

Changed files:
{changed_files}

Code difference:
{code_diff}

Classify the change into exactly one of:

Bug Fix
New Feature
Refactoring
Configuration Change

Then assign exactly one AI-assessed risk level:

Low
Medium
High

Return:

Change Type:
Risk Level:
Explanation:

Keep the explanation short and base it only on the information provided.
Do not claim certainty about future software failures."""


@dataclass
class AnalysisResult:
    change_type: ChangeType
    risk_level: RiskLevel
    explanation: str
    is_mock: bool


SENSITIVE_KEYWORDS = ("auth", "login", "password", "token", "session", "security", "permission")
DB_KEYWORDS = ("migration", "schema", "database", "model", "query")
CONFIG_KEYWORDS = (".env", "config", "dockerfile", "settings", "yml", "yaml")
DEPENDENCY_KEYWORDS = ("package.json", "requirements.txt", "poetry.lock", "package-lock")


def _mock_analyze(commit_message: str, changed_files: list[str], code_diff: str) -> AnalysisResult:
    """Heuristic, deterministic mock analyzer.

    Never presented as a real OpenAI model result (is_mock=True is always
    surfaced to the API/UI layer), per PROJECT_MEMORY.md Section 6/40.
    """
    text = f"{commit_message} {' '.join(changed_files)}".lower()

    if any(k in text for k in CONFIG_KEYWORDS):
        change_type = ChangeType.CONFIGURATION_CHANGE
    elif any(k in commit_message.lower() for k in ("fix", "bug", "patch", "hotfix")):
        change_type = ChangeType.BUG_FIX
    elif any(k in commit_message.lower() for k in ("refactor", "cleanup", "restructure")):
        change_type = ChangeType.REFACTORING
    else:
        change_type = ChangeType.NEW_FEATURE

    diff_size = len(code_diff)
    files_count = len(changed_files)

    risk_score = 0
    if any(k in text for k in SENSITIVE_KEYWORDS):
        risk_score += 2
    if any(k in text for k in DB_KEYWORDS):
        risk_score += 1
    if any(k in text for k in DEPENDENCY_KEYWORDS):
        risk_score += 1
    if files_count > 10:
        risk_score += 1
    if diff_size > 3000:
        risk_score += 1

    if risk_score >= 3:
        risk_level = RiskLevel.HIGH
    elif risk_score >= 1:
        risk_level = RiskLevel.MEDIUM
    else:
        risk_level = RiskLevel.LOW

    reasons = []
    if any(k in text for k in SENSITIVE_KEYWORDS):
        reasons.append("touches authentication/security-related code")
    if any(k in text for k in DB_KEYWORDS):
        reasons.append("touches database-related code")
    if any(k in text for k in DEPENDENCY_KEYWORDS):
        reasons.append("changes project dependencies")
    if files_count > 10:
        reasons.append(f"modifies a large number of files ({files_count})")
    if diff_size > 3000:
        reasons.append("contains a large code diff")
    if not reasons:
        reasons.append("appears limited in scope based on the provided diff")

    explanation = (
        f"[MOCK AI] Classified as {change_type.value} with {risk_level.value} "
        f"assessed risk because the change {', '.join(reasons)}. "
        "This is a heuristic mock result, not an OpenAI model output."
    )

    return AnalysisResult(
        change_type=change_type,
        risk_level=risk_level,
        explanation=explanation,
        is_mock=True,
    )


async def _openai_analyze(commit_message: str, changed_files: list[str], code_diff: str) -> AnalysisResult:
    from openai import AsyncOpenAI

    client = AsyncOpenAI(api_key=settings.openai_api_key)
    prompt = SYSTEM_PROMPT.format(
        commit_message=commit_message,
        changed_files=", ".join(changed_files),
        code_diff=code_diff[:6000],
    )

    response = await client.chat.completions.create(
        model=settings.openai_model,
        messages=[{"role": "user", "content": prompt}],
        temperature=0,
    )
    content = response.choices[0].message.content or ""

    change_type = ChangeType.NEW_FEATURE
    risk_level = RiskLevel.MEDIUM
    explanation = content.strip()

    for line in content.splitlines():
        lower = line.lower()
        if lower.startswith("change type:"):
            value = line.split(":", 1)[1].strip()
            try:
                change_type = ChangeType(value)
            except ValueError:
                pass
        elif lower.startswith("risk level:"):
            value = line.split(":", 1)[1].strip()
            try:
                risk_level = RiskLevel(value)
            except ValueError:
                pass
        elif lower.startswith("explanation:"):
            explanation = line.split(":", 1)[1].strip()

    return AnalysisResult(
        change_type=change_type,
        risk_level=risk_level,
        explanation=explanation,
        is_mock=False,
    )


async def analyze_change(commit_message: str, changed_files: list[str], code_diff: str) -> AnalysisResult:
    if settings.use_mock_ai or not settings.openai_api_key:
        return _mock_analyze(commit_message, changed_files, code_diff)
    return await _openai_analyze(commit_message, changed_files, code_diff)
