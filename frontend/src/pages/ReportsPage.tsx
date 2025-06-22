import React, { useState, useEffect } from 'react';
import { SurveyReport } from '../types';
import api from '../lib/api';
import {
    Box,
    Card,
    CardContent,
    Paper,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Typography,
    Button,
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import AddTaskIcon from '@mui/icons-material/AddTask';
import BarChartIcon from '@mui/icons-material/BarChart';

interface Analytics {
    total_surveys_done: number;
    missions_in_progress: number;
    organization_wide_drone_count: number;
    total_flight_hours: number;
    total_distance_km: number;
    data_collected_gb: number;
}

interface StatCardProps {
    title: string;
    value: number;
}

const StatCard: React.FC<StatCardProps> = ({ title, value }) => (
    <Card sx={{ textAlign: 'center', minHeight: 120, display: 'flex', alignItems: 'center' }}>
        <CardContent sx={{ width: '100%' }}>
            <Typography variant="h4" color="primary" gutterBottom>
                {value}
            </Typography>
            <Typography variant="body2" color="text.secondary">
                {title}
            </Typography>
        </CardContent>
    </Card>
);

const ReportsPage = () => {
    const navigate = useNavigate();
    const [reports, setReports] = useState<SurveyReport[]>([]);
    const [analytics, setAnalytics] = useState<Analytics>({
        total_surveys_done: 0,
        missions_in_progress: 0,
        organization_wide_drone_count: 0,
        total_flight_hours: 0,
        total_distance_km: 0,
        data_collected_gb: 0,
    });
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [reportsResponse, analyticsResponse] = await Promise.all([
                    api.get('/reports'),
                    api.get('/analytics/summary'),
                ]);
                setReports(reportsResponse.data);
                setAnalytics(analyticsResponse.data);
            } catch (err) {
                setError('Failed to fetch reports and analytics');
                console.error(err);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, []);

    if (loading) return <Typography>Loading reports...</Typography>;
    if (error) return <Typography color="error">{error}</Typography>;

    const NoReportsCard = () => (
        <Card
            sx={{
                textAlign: 'center',
                py: 8,
                px: 4,
                background: 'linear-gradient(135deg, #fff5f5 0%, #fed7d7 100%)',
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
                <BarChartIcon
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
                    No Reports Yet
                </Typography>
                <Typography
                    variant="body1"
                    color="text.secondary"
                    sx={{ mb: 4, fontSize: '1.1rem', lineHeight: 1.6 }}
                >
                    Start your first drone survey mission to generate comprehensive reports and analytics.
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
                Survey Reports & Analytics
            </Typography>

            <Box sx={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                gap: 3,
                mb: 4
            }}>
                <StatCard title="Surveys Done" value={analytics.total_surveys_done} />
                <StatCard title="Missions In Progress" value={analytics.missions_in_progress} />
                <StatCard title="Total Drones" value={analytics.organization_wide_drone_count} />
                <StatCard title="Flight Hours" value={analytics.total_flight_hours} />
                <StatCard title="Distance (km)" value={analytics.total_distance_km} />
                <StatCard title="Data (GB)" value={analytics.data_collected_gb} />
            </Box>

            <Typography variant="h5" gutterBottom sx={{ mt: 4 }}>
                Recent Survey Reports
            </Typography>

            {reports.length === 0 ? (
                <NoReportsCard />
            ) : (
                <TableContainer component={Paper}>
                    <Table>
                        <TableHead>
                            <TableRow>
                                <TableCell><strong>Report ID</strong></TableCell>
                                <TableCell><strong>Mission ID</strong></TableCell>
                                <TableCell><strong>Duration</strong></TableCell>
                                <TableCell><strong>Distance</strong></TableCell>
                                <TableCell><strong>Coverage</strong></TableCell>
                                <TableCell><strong>Generated</strong></TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {reports.map((report) => (
                                <TableRow key={report.id} hover>
                                    <TableCell>{report.id}</TableCell>
                                    <TableCell>{report.mission_id}</TableCell>
                                    <TableCell>{Math.round(report.total_duration_s / 60)} min</TableCell>
                                    <TableCell>{(report.total_distance_m / 1000).toFixed(2)} km</TableCell>
                                    <TableCell>{(report.coverage_sq_meters / 10000).toFixed(2)} ha</TableCell>
                                    <TableCell>{new Date(report.generated_at).toLocaleDateString()}</TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </TableContainer>
            )}
        </div>
    );
};

export default ReportsPage; 