from typing import Optional
from datetime import datetime
from sqlmodel import SQLModel, Field

class Session(SQLModel, table=True):
    id: str = Field(primary_key=True)
    created_at: datetime = Field(default_factory=datetime.utcnow)
    is_active: bool = Field(default=True)
    language: str = Field(default="javascript")
    code: str = Field(default="")

class SessionState(SQLModel):
    code: str
    language: str

class User(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    email: str = Field(unique=True, index=True)
    hashed_password: str

class Token(SQLModel):
    access_token: str
    token_type: str
