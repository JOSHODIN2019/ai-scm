"""GitHub repository/commit retrieval.

Isolates the GitHub REST API behind this module the same way
ai_service.py isolates OpenAI -- routes never call httpx/GitHub directly.
Uses the public GitHub REST API (no scraping). Works unauthenticated for
public repos (60 req/hr); set GITHUB_TOKEN to raise that ceiling or
access private repos.
"""

import re
from dataclasses import dataclass

import httpx

from app.core.config import get_settings

settings = get_settings()

GITHUB_API = "https://api.github.com"
COMMITS_PER_PAGE = 20
MAX_DIFF_CHARS = 6000  # matches ai_service's own prompt-size cap

_REPO_URL_RE = re.compile(
    r"^https?://github\.com/(?P<owner>[\w.-]+)/(?P<repo>[\w.-]+?)(?:\.git)?/?$"
)


class GitHubError(Exception):
    """Raised for any GitHub-related failure; routes translate this to HTTP errors."""

    def __init__(self, message: str, status_code: int = 502):
        super().__init__(message)
        self.status_code = status_code


@dataclass
class RepoRef:
    owner: str
    repo: str


@dataclass
class CommitSummary:
    sha: str
    message: str
    author: str
    date: str


@dataclass
class CommitDetail:
    sha: str
    message: str
    author: str
    date: str
    changed_files: list[str]
    code_diff: str
    additions: int
    deletions: int


def parse_repo_url(url: str) -> RepoRef:
    match = _REPO_URL_RE.match(url.strip())
    if not match:
        raise GitHubError(
            "Not a valid GitHub repository URL. Expected format: "
            "https://github.com/<owner>/<repo>",
            status_code=422,
        )
    return RepoRef(owner=match.group("owner"), repo=match.group("repo"))


def _headers() -> dict:
    headers = {"Accept": "application/vnd.github+json", "X-GitHub-Api-Version": "2022-11-28"}
    if settings.github_token:
        headers["Authorization"] = f"Bearer {settings.github_token}"
    return headers


async def _get(path: str, params: dict | None = None) -> httpx.Response:
    try:
        async with httpx.AsyncClient(timeout=15.0) as client:
            response = await client.get(f"{GITHUB_API}{path}", headers=_headers(), params=params)
    except httpx.RequestError as exc:
        raise GitHubError(f"Could not reach GitHub: {exc}", status_code=502) from exc

    if response.status_code == 404:
        raise GitHubError("Repository or commit not found on GitHub.", status_code=404)
    if response.status_code == 403 and response.headers.get("x-ratelimit-remaining") == "0":
        raise GitHubError(
            "GitHub API rate limit exceeded. Configure GITHUB_TOKEN to raise the limit.",
            status_code=429,
        )
    if response.status_code >= 400:
        raise GitHubError(f"GitHub API error ({response.status_code}).", status_code=502)

    return response


def _parse_link_header(link_header: str | None) -> bool:
    """Returns True if the Link header advertises a rel="next" page."""
    if not link_header:
        return False
    return 'rel="next"' in link_header


async def list_commits(repo: RepoRef, page: int = 1, per_page: int = COMMITS_PER_PAGE) -> tuple[list[CommitSummary], bool]:
    response = await _get(
        f"/repos/{repo.owner}/{repo.repo}/commits",
        params={"page": page, "per_page": per_page},
    )
    data = response.json()

    if not data:
        return [], False

    commits = [
        CommitSummary(
            sha=item["sha"],
            message=item["commit"]["message"].split("\n")[0],  # first line only for the list view
            author=(item["commit"]["author"] or {}).get("name")
            or (item.get("author") or {}).get("login")
            or "Unknown",
            date=item["commit"]["author"]["date"] if item["commit"].get("author") else "",
        )
        for item in data
    ]
    has_more = _parse_link_header(response.headers.get("link"))
    return commits, has_more


def _build_diff(files: list[dict]) -> tuple[str, list[str]]:
    changed_files = [f["filename"] for f in files]
    diff_parts = []
    remaining = MAX_DIFF_CHARS

    for f in files:
        if remaining <= 0:
            diff_parts.append(f"\n[Diff truncated -- remaining files omitted for length: {f['filename']} and others]")
            break

        header = f"--- {f['filename']} ({f.get('status', 'modified')}, +{f.get('additions', 0)}/-{f.get('deletions', 0)}) ---"
        patch = f.get("patch")

        if not patch:
            body = "[Diff unavailable for this file -- binary, renamed with no changes, or too large for GitHub to return a patch.]"
        elif len(patch) > remaining:
            body = patch[:remaining] + "\n[... diff truncated for length ...]"
        else:
            body = patch

        section = f"{header}\n{body}"
        diff_parts.append(section)
        remaining -= len(section)

    return "\n\n".join(diff_parts), changed_files


async def get_commit(repo: RepoRef, sha: str) -> CommitDetail:
    response = await _get(f"/repos/{repo.owner}/{repo.repo}/commits/{sha}")
    data = response.json()

    commit_info = data["commit"]
    author_name = (commit_info.get("author") or {}).get("name") or (data.get("author") or {}).get("login") or "Unknown"
    date = (commit_info.get("author") or {}).get("date", "")

    files = data.get("files", [])
    code_diff, changed_files = _build_diff(files)
    stats = data.get("stats", {})

    return CommitDetail(
        sha=data["sha"],
        message=commit_info["message"],
        author=author_name,
        date=date,
        changed_files=changed_files,
        code_diff=code_diff,
        additions=stats.get("additions", 0),
        deletions=stats.get("deletions", 0),
    )
