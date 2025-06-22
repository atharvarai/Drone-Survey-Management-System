from pydantic import BaseModel
from typing import List, Optional, Any
from datetime import datetime
from .models import DroneStatus, MissionStatus, FlightPattern


# --- Waypoint Schemas ---
class MissionWaypointBase(BaseModel):
    latitude: float
    longitude: float
    altitude: float
    sequence_order: int


class MissionWaypointCreate(MissionWaypointBase):
    pass


class MissionWaypoint(MissionWaypointBase):
    id: int
    mission_id: int

    class Config:
        orm_mode = True


# --- Drone Schemas ---
class DroneBase(BaseModel):
    name: str
    model: str
    status: DroneStatus = DroneStatus.available
    battery_level: int
    current_location_lat: Optional[float] = None
    current_location_lon: Optional[float] = None


class DroneCreate(DroneBase):
    pass


class Drone(DroneBase):
    id: int

    class Config:
        orm_mode = True


# --- Mission Schemas ---
class MissionBase(BaseModel):
    name: str
    flight_pattern: FlightPattern
    flight_altitude_m: float
    overlap_percentage: int
    survey_area_geojson: Any  # For GeoJSON object
    data_collection_frequency_hz: float
    sensors_to_use: List[str]


class MissionCreate(MissionBase):
    pass


class Mission(MissionBase):
    id: int
    status: MissionStatus
    created_at: datetime
    started_at: Optional[datetime] = None
    completed_at: Optional[datetime] = None
    drone_id: Optional[int] = None
    waypoints: List[MissionWaypoint] = []

    class Config:
        orm_mode = True


# --- Survey Report Schemas ---
class SurveyReportBase(BaseModel):
    summary: str
    total_duration_s: int
    total_distance_m: float
    coverage_sq_meters: float


class SurveyReportCreate(SurveyReportBase):
    pass


class SurveyReport(SurveyReportBase):
    id: int
    mission_id: int
    generated_at: datetime

    class Config:
        orm_mode = True 