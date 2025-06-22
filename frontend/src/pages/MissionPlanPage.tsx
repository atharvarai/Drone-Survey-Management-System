import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FlightPattern } from '../types';
import api from '../lib/api';
import {
    Box,
    Button,
    Card,
    CardContent,
    FormControl,
    InputLabel,
    MenuItem,
    Select,
    TextField,
    Typography,
    Stack,
    Alert
} from '@mui/material';

const MissionPlanPage = () => {
    const navigate = useNavigate();
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [formData, setFormData] = useState({
        name: '',
        flight_pattern: FlightPattern.GRID,
        sensors_to_use: '',
        flight_altitude_m: 100,
        overlap_percentage: 20,
        data_collection_frequency_hz: 10,
    });

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: name.includes('_m') || name.includes('_hz') || name.includes('percentage')
                ? parseFloat(value) || 0
                : value
        }));
    };

    const handleSelectChange = (name: string, value: any) => {
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSubmitting(true);
        setError(null);

        try {
            // Process sensors: filter out empty values
            const sensorsArray = formData.sensors_to_use
                .split(',')
                .map(s => s.trim())
                .filter(s => s.length > 0);

            // If no sensors provided, use a default one
            const finalSensors = sensorsArray.length > 0 ? sensorsArray : ['camera'];

            // Create a simple polygon for survey area (this is a placeholder - in real app would come from map)
            const defaultSurveyArea = {
                type: 'Polygon',
                coordinates: [[
                    [-0.09, 51.505],
                    [-0.08, 51.505],
                    [-0.08, 51.515],
                    [-0.09, 51.515],
                    [-0.09, 51.505]
                ]]
            };

            const missionData = {
                ...formData,
                sensors_to_use: finalSensors,
                survey_area_geojson: defaultSurveyArea,
            };

            console.log('Sending mission data:', missionData);
            const response = await api.post('/missions', missionData);
            console.log('Mission created successfully:', response.data);
            navigate(`/missions/live/${response.data.id}`);
        } catch (err: any) {
            console.error('Failed to create mission:', err);

            // Extract error message
            let errorMessage = 'Failed to create mission. Please try again.';
            if (err.response?.data?.detail) {
                errorMessage = err.response.data.detail;
            } else if (err.message) {
                errorMessage = err.message;
            }

            setError(errorMessage);
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div>
            <Typography variant="h4" gutterBottom>
                Plan New Mission
            </Typography>

            {error && (
                <Alert severity="error" sx={{ mb: 2 }}>
                    {error}
                </Alert>
            )}

            <Card>
                <CardContent>
                    <form onSubmit={handleSubmit}>
                        <Stack spacing={3}>
                            <TextField
                                name="name"
                                label="Mission Name"
                                value={formData.name}
                                onChange={handleInputChange}
                                fullWidth
                                required
                            />

                            <Box sx={{ display: 'flex', gap: 2, flexDirection: { xs: 'column', sm: 'row' } }}>
                                <FormControl sx={{ flex: 1 }}>
                                    <InputLabel>Flight Pattern</InputLabel>
                                    <Select
                                        value={formData.flight_pattern}
                                        label="Flight Pattern"
                                        onChange={(e) => handleSelectChange('flight_pattern', e.target.value)}
                                    >
                                        <MenuItem value={FlightPattern.GRID}>Grid</MenuItem>
                                        <MenuItem value={FlightPattern.PERIMETER}>Perimeter</MenuItem>
                                        <MenuItem value={FlightPattern.CROSSHATCH}>Crosshatch</MenuItem>
                                    </Select>
                                </FormControl>

                                <TextField
                                    name="sensors_to_use"
                                    label="Sensors (comma-separated)"
                                    value={formData.sensors_to_use}
                                    onChange={handleInputChange}
                                    sx={{ flex: 1 }}
                                    placeholder="camera, lidar, thermal"
                                    helperText="Leave empty to use default camera sensor"
                                />
                            </Box>

                            <Box sx={{ display: 'flex', gap: 2, flexDirection: { xs: 'column', sm: 'row' } }}>
                                <TextField
                                    name="flight_altitude_m"
                                    label="Altitude (meters)"
                                    type="number"
                                    value={formData.flight_altitude_m}
                                    onChange={handleInputChange}
                                    sx={{ flex: 1 }}
                                    inputProps={{ min: 1, max: 500 }}
                                />

                                <TextField
                                    name="overlap_percentage"
                                    label="Overlap (%)"
                                    type="number"
                                    value={formData.overlap_percentage}
                                    onChange={handleInputChange}
                                    sx={{ flex: 1 }}
                                    inputProps={{ min: 0, max: 100 }}
                                />

                                <TextField
                                    name="data_collection_frequency_hz"
                                    label="Data Collection Frequency (Hz)"
                                    type="number"
                                    value={formData.data_collection_frequency_hz}
                                    onChange={handleInputChange}
                                    sx={{ flex: 1 }}
                                    inputProps={{ min: 0.1, max: 100, step: 0.1 }}
                                />
                            </Box>

                            <Box sx={{
                                border: '1px dashed grey',
                                p: 10,
                                textAlign: 'center',
                                borderRadius: 1,
                                backgroundColor: 'grey.50'
                            }}>
                                <Typography color="text.secondary">
                                    Map for survey area selection will be here.
                                </Typography>
                                <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                                    For now, using a default survey area in London
                                </Typography>
                            </Box>

                            <Button
                                type="submit"
                                variant="contained"
                                size="large"
                                disabled={submitting || !formData.name.trim()}
                                sx={{ alignSelf: 'flex-start' }}
                            >
                                {submitting ? 'Creating...' : 'Create Mission'}
                            </Button>
                        </Stack>
                    </form>
                </CardContent>
            </Card>
        </div>
    );
};

export default MissionPlanPage; 