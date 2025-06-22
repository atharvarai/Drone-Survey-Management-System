import React, { useState, useEffect } from 'react';
import { Drone, Mission } from '../types';
import api from '../lib/api';
import DroneCard from '../components/DroneCard';
import MissionList from '../components/MissionList';
import { Box, Typography, Button, Card, CardContent } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import AddTaskIcon from '@mui/icons-material/AddTask';
import RocketLaunchIcon from '@mui/icons-material/RocketLaunch';

// We will create this component next
// import DroneCard from '../components/DroneCard';

const DashboardPage = () => {
    const navigate = useNavigate();
    const [drones, setDrones] = useState<Drone[]>([]);
    const [missions, setMissions] = useState<Mission[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [dronesResponse, missionsResponse] = await Promise.all([
                    api.get('/drones'),
                    api.get('/missions'),
                ]);
                setDrones(dronesResponse.data);
                setMissions(missionsResponse.data);
            } catch (err) {
                setError('Failed to fetch data');
                console.error(err);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, []);

    if (loading) return <Typography>Loading...</Typography>;
    if (error) return <Typography color="error">{error}</Typography>;

    const NoMissionsCard = () => (
        <Card
            sx={{
                textAlign: 'center',
                py: 8,
                px: 4,
                background: 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)',
                border: '2px dashed #e0e0e0',
                borderRadius: 3,
                transition: 'all 0.3s ease',
                '&:hover': {
                    transform: 'translateY(-2px)',
                    boxShadow: '0 8px 25px rgba(0,0,0,0.1)'
                }
            }}
        >
            <CardContent>
                <RocketLaunchIcon
                    sx={{
                        fontSize: 80,
                        color: 'primary.main',
                        mb: 2,
                        opacity: 0.7
                    }}
                />
                <Typography
                    variant="h4"
                    gutterBottom
                    sx={{
                        fontWeight: 'bold',
                        background: 'linear-gradient(45deg, #2196F3 30%, #21CBF3 90%)',
                        backgroundClip: 'text',
                        WebkitBackgroundClip: 'text',
                        WebkitTextFillColor: 'transparent',
                        mb: 2
                    }}
                >
                    No Missions Yet
                </Typography>
                <Typography
                    variant="body1"
                    color="text.secondary"
                    sx={{ mb: 4, fontSize: '1.1rem', lineHeight: 1.6 }}
                >
                    Ready to take off? Create your first drone survey mission and start collecting valuable data from above.
                </Typography>
                <Button
                    variant="contained"
                    size="large"
                    startIcon={<AddTaskIcon />}
                    onClick={() => navigate('/missions/create')}
                    sx={{
                        py: 1.5,
                        px: 4,
                        fontSize: '1.1rem',
                        borderRadius: 2,
                        background: 'linear-gradient(45deg, #2196F3 30%, #21CBF3 90%)',
                        '&:hover': {
                            background: 'linear-gradient(45deg, #1976D2 30%, #1BA0D1 90%)',
                            transform: 'translateY(-1px)',
                            boxShadow: '0 6px 20px rgba(33, 150, 243, 0.4)'
                        }
                    }}
                >
                    Create Your First Mission
                </Button>
            </CardContent>
        </Card>
    );

    return (
        <div>
            <Typography variant="h4" gutterBottom>
                Fleet Dashboard
            </Typography>
            <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 3, mb: 4 }}>
                {drones.map((drone) => (
                    <DroneCard key={drone.id} drone={drone} />
                ))}
            </Box>

            <Typography variant="h4" gutterBottom sx={{ mt: 4 }}>
                Missions
            </Typography>

            {missions.length === 0 ? (
                <NoMissionsCard />
            ) : (
                <MissionList missions={missions} />
            )}
        </div>
    );
};

export default DashboardPage; 