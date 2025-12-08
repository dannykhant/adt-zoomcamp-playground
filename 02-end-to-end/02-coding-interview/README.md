# Coding Interview Platform
 
This is a full-stack application for a real-time collaborative coding interview platform.
 
## Project Structure
 
-   **frontend/**: React + Vite + TypeScript application.
-   **backend/**: FastAPI + SQLModel + Python application.
 
## Getting Started
 
### Prerequisites
 
-   **Node.js**: v20+
-   **Python**: v3.13+
-   **uv**: Python package manager (recommended)
 
### Installation
 
1.  Install root dependencies (concurrently):
    ```bash
    npm install
    ```
 
2.  Install frontend dependencies:
    ```bash
    cd frontend
    npm install
    cd ..
    ```
 
3.  Install backend dependencies:
    ```bash
    cd backend
    uv sync
    cd ..
    ```
    *(Or use the convenience script: `npm run install:all`)*
 
### Running the Application
 
To run both the frontend and backend simultaneously:
 
```bash
npm run dev
```
 
-   **Frontend**: http://localhost:8080
-   **Backend**: http://127.0.0.1:8000
-   **API Docs**: http://127.0.0.1:8000/docs

## Default Credentials

To log in as an interviewer:

-   **Email**: `admin@example.com`
-   **Password**: `password`
