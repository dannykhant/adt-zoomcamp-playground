# Module: 2

Lab: <snake-game-repo>

### 2.1: Intro

- End to end application that includes
    - Frontend with React
    - Backend with FastAPI
    - Database
    - Cloud deployment with Render
        - CI/CD pipeline

### 2.2: Frontend with Lovable

- Prompt for Lovable
    - Snake game with two modes
        - Pass-through
        - Wall
    - Multi-player game
        - Able to log in/ sign up
        - Username shown once logged in
        - Leader board
        - Watching (Following other players)
    - Without backend
        - Mocked with data
        - Centralized API calls
    - Test-cases for the game logic
- Connect with Github to export the code

### 2.3: Antigravity with Codespaces

- Antigravity
    - AI-assisted IDE from Google
- How to connect
    - Download Antigravity and Github cli
    - Login to Github in cli
    - Create a codespace
        - gh cs create
    - Connect to the codespace
        - gh cs ssh -c <cs-name>
    - Get the ssh config
        - gh cs ssh —config -c <cs-name>
    - Store it in ~/.ssh/config
    - Connect to SSH host in Antigravity
    - Open the project folder after connected

### 2.4: Frontend Testing

- Prompt to add tests for the game logic in Antigravity
    - npm test

### 2.5: Implementing Backend

- OpenAPI Specification
    - Used by frontend and backend team to have mutual understanding
- AGENTS.md
    - A config file to let AI agents know what they should do
- Requirements
    - uv for dependency management
    - Allow AntiGravity to run commands in the settings
        - uv
        - mkdir
        - cd
- Prompt
    - Create OpenAPI specification using the frontend mock-api
    - Create FastAPI endpoints using the specification, mocked database and AGENTS.md
        - Create tests to make sure the implementation works
    - Create fake data to check the endpoints

### 2.6: Integrating Frontend & Backend

- Prompt
    - Make frontend use the backend using the OpenAPI specification and AGENTS.md
    - Create Makefile to run the backend
    - Run both frontend & backend at the same time by using Concurrently
- Concurrently
    - Node package to run multiple commands concurrently

### 2.7: Adding Database for Backend

- SQLAlchemy for the database connection
- Prompt
    - Use postgres and sqlite database via sqlalchemy

### 2.7.2: Integration Tests

- Prompt
    - Add integration tests for sqlite to make sure it works and put them in a separate folder

### 2.8: Containerizing & Running with Docker-compose

- Prompt
    - The frontend and backend are ready, now let’s put everything in docker-compose and use postgres and serve frontend with nginx or similar

### 2.9: Cloud Deployment

- The frontend and backend will be put in the same container
- Render will be used for the deployment of the app
- Prompt
    - Put frontend and backend together in the same docker container for the deployment
    - What are the options for the cloud deployment?
    - Deploy the app to Render

### 2.10: CI/CD Pipeline

- The CI/CD pipeline will be with these two steps
    - Run test for frontend & backend
    - If tests pass, deploy it to Render
- Prompt
    - Create CI/CD pipeline with Github actions with two steps - Run tests for frontend and backend first and then if tests pass, deploy it to Render