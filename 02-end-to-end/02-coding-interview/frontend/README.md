# Coding Interview Platform

A real-time collaborative coding interview platform designed to streamline technical interviews. This application allows interviewers to create secure coding sessions and candidates to join instantly via a shared link, with no login required for candidates.

## Features

-   **Real-time Collaboration**: Shared code editor allowing both parties to type and view changes instantly.
-   **Multi-Language Support**: Write and run code in JavaScript, Python, and Rust.
    -   *Note: JavaScript runs in a sandboxed worker. Python & Rust use mocked execution for this demo.*
-   **Role-Based Access**:
    -   **Interviewers**: Secure login to create, manage, and end interview sessions.
    -   **Candidates**: Frictionless entry via shared links or session IDs.
-   **Modern UI/UX**: Built with a premium, responsive design using Tailwind CSS and shadcn/ui.
-   **Session Management**: Generate unique interview links and regenerate them as needed.

## Tech Stack

-   **Framework**: [React](https://react.dev/) with [Vite](https://vitejs.dev/)
-   **Language**: [TypeScript](https://www.typescriptlang.org/)
-   **Styling**: [Tailwind CSS](https://tailwindcss.com/)
-   **UI Components**: [shadcn/ui](https://ui.shadcn.com/)
-   **Icons**: [Lucide React](https://lucide.dev/)
-   **Routing**: [React Router](https://reactrouter.com/)

## Getting Started

### Prerequisites

-   **Node.js**: Version 20 or higher is required.
-   **npm** or **bun**: Package manager.

### Installation

1.  Navigate to the frontend directory:
    ```bash
    cd frontend
    ```

2.  Install dependencies:
    ```bash
    npm install
    # or
    bun install
    ```

3.  Start the development server:
    ```bash
    npm run dev
    ```

4.  Open your browser and navigate to `http://localhost:8080` (or the port shown in your terminal).

## Running Tests

Run the unit tests using `npm` or `bun`:

```bash
npm run test
# or
bun run test
```

## Usage Guide

### For Interviewers

1.  **Login**: Click on the "Interviewer" tab and select "Login as Interviewer".
    -   *Demo Credentials*: Use `admin@example.com` / `password`.
2.  **Create Session**: Once logged in, you will see your unique interview link.
    -   Click **Copy link** to share it with a candidate.
    -   Click the **Refresh icon** inside the input box to generate a new session ID if needed.
3.  **Start Interview**: Click "Start interview room" to enter the collaborative environment.
4.  **End Interview**: Inside the room, use the "End Interview" button in the top right to close the session and return to the home page.

### For Candidates

1.  **Join via Link**: Simply open the URL shared by the interviewer.
2.  **Join via ID**: Alternatively, go to the home page, select the "Candidate" tab, and paste the Room ID or URL.
3.  **Code**: You can immediately start typing in the shared editor.

## Project Structure

-   `src/pages`: Main application pages (Index, Login, InterviewSessionPage).
-   `src/components`: Reusable UI components.
-   `src/utils`: Helper functions for session management and code execution.
-   `src/hooks`: Custom React hooks (e.g., for collaborative session state).

## License

This project is open source and available under the MIT License.
