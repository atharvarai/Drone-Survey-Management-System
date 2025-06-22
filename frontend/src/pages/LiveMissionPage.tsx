import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { MapContainer, TileLayer, Marker, Polyline } from 'react-leaflet';
import { Mission, MissionStatus, MissionWaypoint } from '../types';
import api from '../lib/api';
import useWebSocket from '../hooks/useWebSocket';
import { Box, Button, Card, CardContent, Chip, Typography, Stack, Paper } from '@mui/material';
import PauseCircleIcon from '@mui/icons-material/PauseCircle';
import PlayCircleIcon from '@mui/icons-material/PlayCircle';
import StopCircleIcon from '@mui/icons-material/StopCircle';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

const statusColors: { [key in MissionStatus]: 'primary' | 'secondary' | 'success' | 'error' | 'warning' | 'info' } = {
    [MissionStatus.PLANNED]: 'secondary',
    [MissionStatus.STARTING]: 'info',
    [MissionStatus.IN_PROGRESS]: 'primary',
    [MissionStatus.PAUSED]: 'warning',
    [MissionStatus.COMPLETED]: 'success',
    [MissionStatus.ABORTED]: 'error',
};

// Fix leaflet default markers
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
    iconRetinaUrl: require('leaflet/dist/images/marker-icon-2x.png'),
    iconUrl: require('leaflet/dist/images/marker-icon.png'),
    shadowUrl: require('leaflet/dist/images/marker-shadow.png'),
});

const LiveMissionPage = () => {
    const { id } = useParams<{ id: string }>();
    const [mission, setMission] = useState<Mission | null>(null);
    const [waypoints, setWaypoints] = useState<MissionWaypoint[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);

    // Note: The WebSocket URL needs to use ws:// or wss://, not http:// or https://
    const wsUrl = `ws://127.0.0.1:8000/ws/missions/${id}`;
    const { lastMessage, isConnected } = useWebSocket(wsUrl);

    // State for real-time data
    const [dronePosition, setDronePosition] = useState<{ lat: number; lon: number } | null>(null);
    const [missionProgress, setMissionProgress] = useState(0);

    useEffect(() => {
        const fetchMission = async () => {
            try {
                const response = await api.get(`/missions/${id}`);
                setMission(response.data);
                setWaypoints(response.data.waypoints);
                // Set initial drone position if available, otherwise default to a location
                const initialLat = response.data.drone?.current_location_lat ?? 51.505;
                const initialLon = response.data.drone?.current_location_lon ?? -0.09;
                setDronePosition({ lat: initialLat, lon: initialLon });
            } catch (err) {
                setError('Failed to fetch mission details');
                console.error(err);
            } finally {
                setLoading(false);
            }
        };

        if (id) {
            fetchMission();
        }
    }, [id]);

    useEffect(() => {
        if (lastMessage) {
            if (lastMessage.type === 'drone_position_update') {
                setDronePosition({ lat: lastMessage.lat, lon: lastMessage.lon });
            }
            if (lastMessage.type === 'mission_progress_update') {
                setMissionProgress(lastMessage.percent_complete);
            }
            if (lastMessage.type === 'mission_status_update' && mission) {
                setMission({ ...mission, status: lastMessage.status });
            }
        }
    }, [lastMessage, mission]);

    const handleControlClick = async (action: 'start' | 'pause' | 'resume' | 'abort' | 'complete') => {
        try {
            const response = await api.post(`/missions/${id}/control`, { action });
            setMission(response.data); // Update mission state with the response from the server
        } catch (err: any) {
            console.error(`Failed to ${action} mission`, err);
            alert(`Failed to ${action} mission: ${err.response?.data?.detail || 'Server error'}`);
        }
    };

    if (loading) return <Typography>Loading mission...</Typography>;
    if (error) return <Typography color="error">{error}</Typography>;
    if (!mission) return <Typography>Mission not found.</Typography>;

    const mapPosition: [number, number] = dronePosition ? [dronePosition.lat, dronePosition.lon] : [51.505, -0.09];
    const waypointPath: [number, number][] = waypoints.map(wp => [wp.latitude, wp.longitude]);

    return (
        <Paper sx={{ p: 3, backgroundColor: '#f5f5f5' }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Typography variant="h4" component="h1">
                    Live Mission: {mission.name}
                </Typography>
                <Chip
                    label={mission.status.replace('_', ' ').toUpperCase()}
                    color={statusColors[mission.status] || 'default'}
                    sx={{ fontWeight: 'bold', fontSize: '1rem' }}
                />
            </Box>

            <Box sx={{ display: 'flex', gap: 3, flexDirection: { xs: 'column', lg: 'row' } }}>
                <Box sx={{ flex: 3, minHeight: '60vh' }}>
                    <MapContainer center={mapPosition} zoom={13} style={{ height: '100%', width: '100%', borderRadius: '8px' }}>
                        <TileLayer
                            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                        />
                        {waypointPath.length > 0 && <Polyline positions={waypointPath} color="blue" />}
                        {dronePosition && <Marker position={[dronePosition.lat, dronePosition.lon]} />}
                    </MapContainer>
                </Box>
                <Box sx={{ flex: 1 }}>
                    <Card>
                        <CardContent>
                            <Typography variant="h5" gutterBottom>Mission Control</Typography>
                            <Stack spacing={2}>
                                {mission.status === MissionStatus.PLANNED && (
                                    <Button variant="contained" color="success" startIcon={<PlayCircleIcon />} onClick={() => handleControlClick('start')}>Start Mission</Button>
                                )}

                                {mission.status === MissionStatus.IN_PROGRESS && (
                                    <>
                                        <Button variant="contained" color="warning" startIcon={<PauseCircleIcon />} onClick={() => handleControlClick('pause')}>Pause Mission</Button>
                                        <Button variant="contained" color="primary" startIcon={<CheckCircleIcon />} onClick={() => handleControlClick('complete')}>Complete Mission</Button>
                                    </>
                                )}

                                {mission.status === MissionStatus.PAUSED && (
                                    <Button variant="contained" color="success" startIcon={<PlayCircleIcon />} onClick={() => handleControlClick('resume')}>Resume Mission</Button>
                                )}

                                {(mission.status === MissionStatus.IN_PROGRESS || mission.status === MissionStatus.PAUSED) && (
                                    <Button variant="outlined" color="error" startIcon={<StopCircleIcon />} onClick={() => handleControlClick('abort')}>Abort Mission</Button>
                                )}

                                {mission.status === MissionStatus.COMPLETED && (
                                    <Typography color="success.main" variant="h6">Mission Completed</Typography>
                                )}
                                {mission.status === MissionStatus.ABORTED && (
                                    <Typography color="error.main" variant="h6">Mission Aborted</Typography>
                                )}
                            </Stack>
                            <Typography variant="h6" gutterBottom sx={{ mt: 3 }}>Details</Typography>
                            <p><strong>Pattern:</strong> {mission.flight_pattern}</p>
                            <p><strong>Altitude:</strong> {mission.flight_altitude_m}m</p>

                            <Typography variant="h6" gutterBottom sx={{ mt: 3 }}>Live Data</Typography>
                            <p><strong>Progress:</strong> {missionProgress}%</p>
                            <p><strong>Position:</strong> {dronePosition?.lat.toFixed(4)}, {dronePosition?.lon.toFixed(4)}</p>
                        </CardContent>
                    </Card>
                </Box>
            </Box>
        </Paper>
    );
};

export default LiveMissionPage; 