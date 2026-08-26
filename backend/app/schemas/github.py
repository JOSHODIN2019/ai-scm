from pydantic import BaseModel


class GitHubCommitSummary(BaseModel):
    sha: str
    message: str
    author: str
    date: str


class GitHubCommitListResponse(BaseModel):
    commits: list[GitHubCommitSummary]
    page: int
    has_more: bool


class ImportCommitRequest(BaseModel):
    commit_sha: str
