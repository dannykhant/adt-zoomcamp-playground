from fastapi import FastAPI, Depends, HTTPException, status
from fastapi.middleware.cors import CORSMiddleware
from sqlmodel import Session, select
from contextlib import asynccontextmanager
from typing import Annotated
import uuid

from .database import create_db_and_tables, get_session
from .models import Session as InterviewSession, SessionState, User, Token
from .auth import get_password_hash, verify_password, create_access_token, get_current_user

@asynccontextmanager
async def lifespan(app: FastAPI):
    create_db_and_tables()
    # Create a default user for testing if not exists
    with next(get_session()) as session:
        user = session.exec(select(User).where(User.email == "admin@example.com")).first()
        if not user:
            user = User(email="admin@example.com", hashed_password=get_password_hash("password"))
            session.add(user)
            session.commit()
    yield

app = FastAPI(lifespan=lifespan)

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

DbSession = Annotated[Session, Depends(get_session)]

@app.get("/health")
def health():
    return {"status": "ok"}

from fastapi.security import OAuth2PasswordRequestForm

@app.post("/auth/login", response_model=Token)
def login(db: DbSession, form_data: Annotated[OAuth2PasswordRequestForm, Depends()]):
    user = db.exec(select(User).where(User.email == form_data.username)).first()
    if not user or not verify_password(form_data.password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    access_token = create_access_token(data={"sub": user.email})
    return {"access_token": access_token, "token_type": "bearer"}

@app.post("/sessions", response_model=InterviewSession, status_code=status.HTTP_201_CREATED)
def create_session(db: DbSession, current_user: str = Depends(get_current_user)):
    # Generate a random session ID
    session_id = str(uuid.uuid4())[:8] # Short ID for easier sharing
    new_session = InterviewSession(id=session_id)
    db.add(new_session)
    db.commit()
    db.refresh(new_session)
    return new_session

@app.get("/sessions/{session_id}", response_model=InterviewSession)
def get_session_details(session_id: str, db: DbSession):
    session = db.get(InterviewSession, session_id)
    if not session:
        raise HTTPException(status_code=404, detail="Session not found")
    return session

@app.delete("/sessions/{session_id}")
def end_session(session_id: str, db: DbSession, current_user: str = Depends(get_current_user)):
    session = db.get(InterviewSession, session_id)
    if not session:
        raise HTTPException(status_code=404, detail="Session not found")
    db.delete(session)
    db.commit()
    return {"message": "Session ended"}

@app.get("/sessions/{session_id}/state", response_model=SessionState)
def get_session_state(session_id: str, db: DbSession):
    session = db.get(InterviewSession, session_id)
    if not session:
        raise HTTPException(status_code=404, detail="Session not found")
    return SessionState(code=session.code, language=session.language)

@app.post("/sessions/{session_id}/state", response_model=SessionState)
def update_session_state(session_id: str, state: SessionState, db: DbSession):
    session = db.get(InterviewSession, session_id)
    if not session:
        raise HTTPException(status_code=404, detail="Session not found")
    
    session.code = state.code
    session.language = state.language
    db.add(session)
    db.commit()
    db.refresh(session)
    return SessionState(code=session.code, language=session.language)