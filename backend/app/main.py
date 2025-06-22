from fastapi import FastAPI, Depends, HTTPException, WebSocket, WebSocketDisconnect
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from typing import List
from pydantic import BaseModel, Field

from . import crud, models, schemas
from .database import SessionLocal, engine
from .websocket import manager

models.Base.metadata.create_all(bind=engine)

app = FastAPI()

# --- CORS Middleware ---
# This allows the frontend (running on localhost:3000) to communicate with the backend.
origins = [
    "http://localhost:3000",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Dependency
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


@app.get("/")
def read_root():
    return {"message": "Welcome to the Drone Survey Management System API"}

# --- Drone Endpoints ---

@app.post("/api/drones", response_model=schemas.Drone)
def create_drone(drone: schemas.DroneCreate, db: Session = Depends(get_db)):
    return crud.create_drone(db=db, drone=drone)


@app.get("/api/drones", response_model=List[schemas.Drone])
def read_drones(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    drones = crud.get_drones(db, skip=skip, limit=limit)
    return drones


@app.get("/api/drones/{drone_id}", response_model=schemas.Drone)
def read_drone(drone_id: int, db: Session = Depends(get_db)):
    db_drone = crud.get_drone(db, drone_id=drone_id)
    if db_drone is None:
        raise HTTPException(status_code=404, detail="Drone not found")
    return db_drone

# --- Mission Endpoints ---

@app.post("/api/missions", response_model=schemas.Mission)
def create_mission(mission: schemas.MissionCreate, db: Session = Depends(get_db)):
    # Here you would add the logic to calculate waypoints based on the
    # survey_area_geojson and flight_pattern.
    # For now, we'll just create the mission record.
    return crud.create_mission(db=db, mission=mission)


@app.get("/api/missions", response_model=List[schemas.Mission])
def read_missions(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    missions = crud.get_missions(db, skip=skip, limit=limit)
    return missions


@app.get("/api/missions/{mission_id}", response_model=schemas.Mission)
def read_mission(mission_id: int, db: Session = Depends(get_db)):
    db_mission = crud.get_mission(db, mission_id=mission_id)
    if db_mission is None:
        raise HTTPException(status_code=404, detail="Mission not found")
    return db_mission

# --- Mission Control ---

class MissionControl(BaseModel):
    action: str = Field(..., pattern="^(start|pause|resume|abort|complete)$")

@app.post("/api/missions/{mission_id}/control", response_model=schemas.Mission)
def control_mission(mission_id: int, control: MissionControl, db: Session = Depends(get_db)):
    mission = crud.get_mission(db, mission_id=mission_id)
    if not mission:
        raise HTTPException(status_code=404, detail="Mission not found")

    action = control.action
    current_status = mission.status
    new_status = None

    # State machine logic
    if action == 'start' and current_status == models.MissionStatus.planned:
        new_status = models.MissionStatus.in_progress
    elif action == 'pause' and current_status == models.MissionStatus.in_progress:
        new_status = models.MissionStatus.paused
    elif action == 'resume' and current_status == models.MissionStatus.paused:
        new_status = models.MissionStatus.in_progress
    elif action == 'abort' and current_status in [models.MissionStatus.in_progress, models.MissionStatus.paused]:
        new_status = models.MissionStatus.aborted
    elif action == 'complete' and current_status == models.MissionStatus.in_progress:
        new_status = models.MissionStatus.completed
    else:
        raise HTTPException(
            status_code=400,
            detail=f"Invalid action '{action}' for current status '{current_status}'"
        )

    # Update mission status
    updated_mission = crud.update_mission_status(db, mission_id, new_status)

    # Generate a report for completed or aborted missions
    if new_status in [models.MissionStatus.completed, models.MissionStatus.aborted]:
        existing_report = crud.get_report_by_mission(db, mission_id=mission_id)
        if not existing_report:
            report_data = schemas.SurveyReportCreate(
                summary=f"Survey report for mission '{updated_mission.name}'. Status: {new_status.value}",
                total_duration_s=3600,
                total_distance_m=15000,
                coverage_sq_meters=500000,
            )
            crud.create_survey_report(db, report=report_data, mission_id=mission_id)
    
    # We need to return the mission object with all its relationships loaded
    # The `updated_mission` from crud is a raw model, let's refetch it
    final_mission = crud.get_mission(db, mission_id=mission_id)
    return final_mission

# --- WebSocket Endpoint ---

@app.websocket("/ws/missions/{mission_id}")
async def websocket_endpoint(websocket: WebSocket, mission_id: int):
    await manager.connect(websocket)
    try:
        while True:
            # The backend will push updates. Client doesn't need to send anything.
            # We can keep the connection alive by waiting for a message that never comes
            # or by implementing a ping/pong mechanism.
            data = await websocket.receive_text()
            # This part is for potential bi-directional communication if needed later
            # For now, we primarily broadcast from the server.
    except WebSocketDisconnect:
        manager.disconnect(websocket)
        print(f"Client disconnected from mission {mission_id}")

# --- Reporting and Analytics Endpoints ---

@app.get("/api/reports", response_model=List[schemas.SurveyReport])
def read_reports(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    reports = crud.get_reports(db, skip=skip, limit=limit)
    return reports

@app.get("/api/analytics/summary")
def get_analytics_summary(db: Session = Depends(get_db)):
    # In a real application, this would be a complex query.
    # For now, we'll return some hardcoded values and some real ones.
    total_surveys = db.query(models.Mission).count()
    completed_missions = db.query(models.Mission).filter(models.Mission.status == 'completed').count()

    return {
        "total_surveys_done": completed_missions,
        "total_flight_hours": 123, # Placeholder
        "total_distance_km": 456, # Placeholder
        "data_collected_gb": 789, # Placeholder
        "organization_wide_drone_count": db.query(models.Drone).count(),
        "missions_in_progress": db.query(models.Mission).filter(models.Mission.status == 'in_progress').count()
    } 