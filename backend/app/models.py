import enum
from sqlalchemy import (
    Column,
    Integer,
    String,
    Float,
    Enum,
    DateTime,
    JSON,
    ForeignKey,
    Text,
)
from sqlalchemy.orm import relationship
from .database import Base
import datetime


class DroneStatus(str, enum.Enum):
    available = "available"
    in_mission = "in_mission"
    maintenance = "maintenance"


class MissionStatus(str, enum.Enum):
    planned = "planned"
    starting = "starting"
    in_progress = "in_progress"
    paused = "paused"
    completed = "completed"
    aborted = "aborted"


class FlightPattern(str, enum.Enum):
    grid = "grid"
    perimeter = "perimeter"
    crosshatch = "crosshatch"


class Drone(Base):
    __tablename__ = "drones"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(50), unique=True, index=True)
    model = Column(String(50))
    status = Column(Enum(DroneStatus), default=DroneStatus.available)
    battery_level = Column(Integer)
    current_location_lat = Column(Float)
    current_location_lon = Column(Float)

    missions = relationship("Mission", back_populates="drone")


class Mission(Base):
    __tablename__ = "missions"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(100), index=True)
    status = Column(Enum(MissionStatus), default=MissionStatus.planned)
    flight_pattern = Column(Enum(FlightPattern))
    flight_altitude_m = Column(Float)
    overlap_percentage = Column(Integer)
    survey_area_geojson = Column(JSON)
    data_collection_frequency_hz = Column(Float)
    sensors_to_use = Column(JSON)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)
    started_at = Column(DateTime, nullable=True)
    completed_at = Column(DateTime, nullable=True)

    drone_id = Column(Integer, ForeignKey("drones.id"), nullable=True)
    drone = relationship("Drone", back_populates="missions")
    waypoints = relationship("MissionWaypoint", back_populates="mission")
    report = relationship("SurveyReport", back_populates="mission", uselist=False)


class MissionWaypoint(Base):
    __tablename__ = "mission_waypoints"

    id = Column(Integer, primary_key=True, index=True)
    mission_id = Column(Integer, ForeignKey("missions.id"))
    latitude = Column(Float)
    longitude = Column(Float)
    altitude = Column(Float)
    sequence_order = Column(Integer)

    mission = relationship("Mission", back_populates="waypoints")


class SurveyReport(Base):
    __tablename__ = "survey_reports"

    id = Column(Integer, primary_key=True, index=True)
    mission_id = Column(Integer, ForeignKey("missions.id"), unique=True)
    summary = Column(Text)
    total_duration_s = Column(Integer)
    total_distance_m = Column(Float)
    coverage_sq_meters = Column(Float)
    generated_at = Column(DateTime, default=datetime.datetime.utcnow)

    mission = relationship("Mission", back_populates="report") 