# Coding Interview Platform - Backend

This is the backend service for the Coding Interview Platform, built with FastAPI. It handles user authentication, session management, and real-time state synchronization for collaborative coding interviews.

## Features

-   **Authentication**: JWT-based authentication using OAuth2 password flow.
-   **Session Management**: Create, retrieve, and delete interview sessions.
-   **State Synchronization**: Store and retrieve the current state (code & language) of an interview session.
-   **Database**: Supports PostgreSQL for production and SQLite for local development (via SQLModel).

## Tech Stack

-   **Framework**: [FastAPI](https://fastapi.tiangolo.com/)
-   **Database ORM**: [SQLModel](https://sqlmodel.tiangolo.com/) (SQLAlchemy + Pydantic)
-   **Authentication**: `python-jose` (JWT), `bcrypt` (Hashing)
-   **Testing**: `pytest`

## Getting Started

### Prerequisites

-   **Python**: Version 3.13 or higher.
-   **uv** (Recommended) or **pip**: Package manager.

### Installation

1.  Navigate to the backend directory:
    ```bash
    cd backend
    ```

2.  Install dependencies:
    ```bash
    # Using uv
    uv sync
    
    # OR using pip
    pip install -r requirements.txt # (If you generated one)
    # Manually:
    pip install "fastapi[standard]" sqlmodel psycopg2-binary python-jose[cryptography] bcrypt
    ```

### Running the Server

Start the development server with auto-reload:

```bash
# Using uv
uv run fastapi dev main.py

# OR directly if installed in environment
fastapi dev main.py
```

The server will start at `http://127.0.0.1:8000`.

### API Documentation

FastAPI automatically generates interactive API documentation. Once the server is running, visit:

-   **Swagger UI**: [http://127.0.0.1:8000/docs](http://127.0.0.1:8000/docs)
-   **ReDoc**: [http://127.0.0.1:8000/redoc](http://127.0.0.1:8000/redoc)

## Default Credentials

A default admin user is created automatically on startup for testing purposes:

-   **Username (Email)**: `admin@example.com`
-   **Password**: `password`

Use these credentials to authorize in the Swagger UI (click the "Authorize" button).

## Database Configuration

By default, the application uses a local SQLite database (`database.db`).

To use **PostgreSQL**, set the `DATABASE_URL` environment variable before starting the server:

```bash
export DATABASE_URL="postgresql://user:password@localhost/dbname"
fastapi dev main.py
```

## Running Tests

Run the tests (including unit and integration tests) using `pytest`:

```bash
# Using uv
uv run pytest

# OR directly
pytest
```

## Project Structure

-   `main.py`: Application entry point and API endpoints.
-   `models.py`: Database models (User, Session, SessionState).
-   `database.py`: Database connection and session management.
-   `auth.py`: Authentication logic (hashing, JWT token generation).
-   `tests/`: Unit tests.
