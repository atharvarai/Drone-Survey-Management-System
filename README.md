# Drone Survey Management System

This project is a web-based platform for managing autonomous drone surveys, built with a Python (FastAPI) backend and a React (TypeScript) frontend.

## Project Status

All key functional requirements from the project scope have been implemented, providing a complete end-to-end user flow:

-   **Mission Planning:** Users can define and create new survey missions with various parameters.
-   **Fleet Dashboard:** Users can view the status of all drones and a list of all planned missions.
-   **Real-time Monitoring:** Users can open a live view for any mission to see a (simulated) drone moving on a map, updated in real-time via WebSockets.
-   **Reporting & Analytics:** A dedicated page shows overall system analytics and a list of detailed survey reports.

## How to Run the Application

### 1. Prerequisites

-   Python 3.8+
-   Node.js (LTS)
-   MySQL Server
-   Git

### 2. Backend Setup

First, set up your MySQL database. You need to create the database manually before running the backend for the first time.

1.  **Create the Database:**
    Open MySQL Workbench and connect to your local MySQL server. In a query tab, run the following SQL command:
    ```sql
    CREATE DATABASE drone_survey_db;
    ```

2.  **Configure Connection:**
    Next, configure the application's connection to the database by creating a `.env` file in the `backend/` directory:

```env
# backend/.env
DB_HOST=localhost
DB_PORT=3306
DB_USER=your_user
DB_PASSWORD=your_password
DB_NAME=drone_survey_db
```

Now, install dependencies and run the server:

```sh
# From the project root
cd backend
python -m venv venv
.\venv\Scripts\activate  # On Windows
pip install -r requirements.txt
uvicorn app.main:app --reload
```

The backend API will be available at `http://127.0.0.1:8000`.

### 3. Frontend Setup

In a separate terminal, set up and run the React application:

```sh
# From the project root
cd frontend
npm install
npm start
```

The frontend will be available at `http://localhost:3000`.

## Next Steps & Future Work

While the core functionality is complete, the following areas can be expanded upon:

-   **Backend Mission Simulator:** Implement the logic that simulates a drone's flight path, battery drain, and mission progress.
-   **Waypoint Generation:** Implement algorithms to automatically generate flight path waypoints based on the user-defined survey area and flight pattern.
-   **Interactive Map for Mission Planning:** Enhance the mission planning page to allow users to draw a polygon on the map to define the survey area.
-   **User Authentication:** Add a login system to secure the application.
-   **UI/UX Polish:** Improve the overall styling, layout, and user experience. 