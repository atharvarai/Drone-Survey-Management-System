import React from 'react';
import { Card, CardContent, Typography, Chip, Box } from '@mui/material';
import { Drone, DroneStatus } from '../types';

interface DroneCardProps {
    drone: Drone;
}

const statusColors: { [key in DroneStatus]: 'success' | 'warning' | 'default' } = {
    [DroneStatus.AVAILABLE]: 'success',
    [DroneStatus.IN_MISSION]: 'warning',
    [DroneStatus.MAINTENANCE]: 'default',
};

const DroneCard: React.FC<DroneCardProps> = ({ drone }) => {
    return (
        <Card sx={{ minWidth: 275 }}>
            <CardContent>
                <Typography variant="h5" component="div" gutterBottom>
                    {drone.name}
                </Typography>
                <Typography sx={{ mb: 1.5 }} color="text.secondary">
                    {drone.model}
                </Typography>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Chip label={drone.status.replace('_', ' ').toUpperCase()} color={statusColors[drone.status]} size="small" />
                    <Typography variant="h6">
                        {drone.battery_level}%
                    </Typography>
                </Box>
            </CardContent>
        </Card>
    );
};

export default DroneCard; 