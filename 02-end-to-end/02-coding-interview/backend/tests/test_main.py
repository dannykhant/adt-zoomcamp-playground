from fastapi.testclient import TestClient
from sqlmodel import Session, SQLModel, create_engine
from sqlmodel.pool import StaticPool
import pytest

from ..main import app, get_session
from ..database import engine as prod_engine
from ..models import User
from ..auth import get_password_hash

# Use in-memory SQLite for testing
test_engine = create_engine(
    "sqlite://", 
    connect_args={"check_same_thread": False}, 
    poolclass=StaticPool
)

def create_test_db_and_tables():
    SQLModel.metadata.create_all(test_engine)

@pytest.fixture(name="session")
def session_fixture():
    create_test_db_and_tables()
    with Session(test_engine) as session:
        yield session
    SQLModel.metadata.drop_all(test_engine)

@pytest.fixture(name="client")
def client_fixture(session: Session):
    def get_session_override():
        return session

    app.dependency_overrides[get_session] = get_session_override
    client = TestClient(app)
    yield client
    app.dependency_overrides.clear()

def test_health(client: TestClient):
    response = client.get("/health")
    assert response.status_code == 200
    assert response.json() == {"status": "ok"}

def test_create_session_unauthorized(client: TestClient):
    response = client.post("/sessions")
    assert response.status_code == 401

def test_integration_flow(client: TestClient, session: Session):
    # Create admin user
    user = User(email="admin@example.com", hashed_password=get_password_hash("password"))
    session.add(user)
    session.commit()

    # 1. Login
    login_data = {"username": "admin@example.com", "password": "password"}
    response = client.post("/auth/login", data=login_data)
    assert response.status_code == 200
    token = response.json()["access_token"]
    headers = {"Authorization": f"Bearer {token}"}

    # 2. Create Session
    response = client.post("/sessions", headers=headers)
    assert response.status_code == 201
    session_data = response.json()
    session_id = session_data["id"]
    assert "id" in session_data

    # 3. Get Session Details
    response = client.get(f"/sessions/{session_id}")
    assert response.status_code == 200
    assert response.json()["id"] == session_id

    # 4. Update Session State
    new_state = {"code": "print('hello')", "language": "python"}
    response = client.post(f"/sessions/{session_id}/state", json=new_state, headers=headers)
    assert response.status_code == 200
    assert response.json()["code"] == "print('hello')"

    # 5. Get Session State
    response = client.get(f"/sessions/{session_id}/state")
    assert response.status_code == 200
    assert response.json()["code"] == "print('hello')"

    # 6. End Session
    response = client.delete(f"/sessions/{session_id}", headers=headers)
    assert response.status_code == 200

    # 7. Verify Session Ended
    response = client.get(f"/sessions/{session_id}")
    assert response.status_code == 404

