from pydantic import BaseModel, Field


class SoftwareChangeCreate(BaseModel):
    commit_id: str = Field(min_length=1, max_length=100)
    commit_message: str = Field(min_length=1)
    author: str = Field(min_length=1, max_length=200)
    changed_files: list[str] = Field(default_factory=list)
    code_diff: str = ""
    commit_date: str


class SoftwareChangePublic(BaseModel):
    id: str
    project_id: str
    commit_id: str
    commit_message: str
    author: str
    changed_files: list[str]
    code_diff: str
    commit_date: str
    created_at: str
