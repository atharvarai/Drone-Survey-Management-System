import React from 'react';
import { Mission } from '../types';
import { Link as RouterLink } from 'react-router-dom';
import {
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Paper,
    Button,
    Typography,
} from '@mui/material';
import RocketLaunchIcon from '@mui/icons-material/RocketLaunch';

interface MissionListProps {
    missions: Mission[];
}

const MissionList: React.FC<MissionListProps> = ({ missions }) => {
    if (missions.length === 0) {
        return <Typography sx={{ mt: 2 }}>No missions planned yet.</Typography>;
    }

    return (
        <TableContainer component={Paper}>
            <Table sx={{ minWidth: 650 }} aria-label="simple table">
                <TableHead>
                    <TableRow>
                        <TableCell>Name</TableCell>
                        <TableCell>Status</TableCell>
                        <TableCell>Pattern</TableCell>
                        <TableCell align="right">Actions</TableCell>
                    </TableRow>
                </TableHead>
                <TableBody>
                    {missions.map((mission) => (
                        <TableRow
                            key={mission.id}
                            sx={{ '&:last-child td, &:last-child th': { border: 0 } }}
                        >
                            <TableCell component="th" scope="row">
                                {mission.name}
                            </TableCell>
                            <TableCell>{mission.status}</TableCell>
                            <TableCell>{mission.flight_pattern}</TableCell>
                            <TableCell align="right">
                                <Button
                                    variant="contained"
                                    component={RouterLink}
                                    to={`/missions/live/${mission.id}`}
                                    startIcon={<RocketLaunchIcon />}
                                >
                                    Monitor
                                </Button>
                            </TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
        </TableContainer>
    );
};

export default MissionList; 