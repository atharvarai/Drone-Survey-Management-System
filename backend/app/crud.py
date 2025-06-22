from sqlalchemy.orm import Session, joinedload
from . import models, schemas
import datetime


# --- Drone CRUD ---

def get_drone(db: Session, drone_id: int):
    return db.query(models.Drone).filter(models.Drone.id == drone_id).first()


def get_drones(db: Session, skip: int = 0, limit: int = 100):
    return db.query(models.Drone).offset(skip).limit(limit).all()


def create_drone(db: Session, drone: schemas.DroneCreate):
    db_drone = models.Drone(**drone.dict())
    db.add(db_drone)
    db.commit()
    db.refresh(db_drone)
    return db_drone


# --- Mission CRUD ---

def get_mission(db: Session, mission_id: int):
    return db.query(models.Mission).options(joinedload(models.Mission.waypoints)).filter(models.Mission.id == mission_id).first()


def get_missions(db: Session, skip: int = 0, limit: int = 100):
    return db.query(models.Mission).offset(skip).limit(limit).all()


def create_mission(db: Session, mission: schemas.MissionCreate):
    # Note: Waypoint generation logic will be added later
    db_mission = models.Mission(**mission.dict())
    db.add(db_mission)
    db.commit()
    db.refresh(db_mission)
    return db_mission


# --- Waypoint CRUD ---

def create_mission_waypoint(db: Session, waypoint: schemas.MissionWaypointCreate, mission_id: int):
    db_waypoint = models.MissionWaypoint(**waypoint.dict(), mission_id=mission_id)
    db.add(db_waypoint)
    db.commit()
    db.refresh(db_waypoint)
    return db_waypoint


# --- Report CRUD ---

def get_report_by_mission(db: Session, mission_id: int):
    return db.query(models.SurveyReport).filter(models.SurveyReport.mission_id == mission_id).first()


def get_reports(db: Session, skip: int = 0, limit: int = 100):
    return db.query(models.SurveyReport).offset(skip).limit(limit).all()


def create_survey_report(db: Session, report: schemas.SurveyReportCreate, mission_id: int):
    db_report = models.SurveyReport(**report.dict(), mission_id=mission_id)
    db.add(db_report)
    db.commit()
    db.refresh(db_report)
    return db_report


def update_mission_status(db: Session, mission_id: int, status: models.MissionStatus):
    db_mission = get_mission(db, mission_id)
    if db_mission:
        # Set start time if mission is starting and not already started
        if status == models.MissionStatus.in_progress and db_mission.started_at is None:
            db_mission.started_at = datetime.datetime.utcnow()

        db_mission.status = status
        
        if status in [models.MissionStatus.completed, models.MissionStatus.aborted]:
            db_mission.completed_at = datetime.datetime.utcnow()

        db.commit()
        db.refresh(db_mission)
    return db_mission 