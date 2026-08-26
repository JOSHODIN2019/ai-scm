from pydantic import BaseModel, Field


class ProjectCreate(BaseModel):
    project_name: str = Field(min_length=1, max_length=200)
    repository_url: str | None = None
    description: str | None = None


class ProjectUpdate(BaseModel):
    project_name: str | None = Field(default=None, min_length=1, max_length=200)
    repository_url: str | None = None
    description: str | None = None


class ProjectPublic(BaseModel):
    id: str
    user_id: str
    project_name: str
    repository_url: str | None = None
    description: str | None = None
    created_at: str
    updated_at: str
