export enum DroneStatus {
    AVAILABLE = "available",
    IN_MISSION = "in_mission",
    MAINTENANCE = "maintenance",
}

export enum MissionStatus {
    PLANNED = "planned",
    STARTING = "starting",
    IN_PROGRESS = "in_progress",
    PAUSED = "paused",
    COMPLETED = "completed",
    ABORTED = "aborted",
}

export enum FlightPattern {
    GRID = "grid",
    PERIMETER = "perimeter",
    CROSSHATCH = "crosshatch",
}

export interface MissionWaypoint {
    id: number;
    mission_id: number;
    latitude: number;
    longitude: number;
    altitude: number;
    sequence_order: number;
}

export interface Drone {
    id: number;
    name: string;
    model: string;
    status: DroneStatus;
    battery_level: number;
    current_location_lat?: number;
    current_location_lon?: number;
}

export interface Mission {
    id: number;
    name: string;
    status: MissionStatus;
    flight_pattern: FlightPattern;
    flight_altitude_m: number;
    overlap_percentage: number;
    survey_area_geojson: any; // Or a more specific GeoJSON type
    data_collection_frequency_hz: number;
    sensors_to_use: string[];
    created_at: string; // or Date
    started_at?: string; // or Date
    completed_at?: string; // or Date
    drone_id?: number;
    waypoints: MissionWaypoint[];
}

export interface SurveyReport {
    id: number;
    mission_id: number;
    summary: string;
    total_duration_s: number;
    total_distance_m: number;
    coverage_sq_meters: number;
    generated_at: string; // or Date
} 