import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Box, Grid, Card, CardContent, Typography, CircularProgress, Alert } from '@mui/material';
import { RootState, AppDispatch } from '../store';
import { fetchMetrics } from '../store/complaintSlice';

const Dashboard = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { metrics, metricsLoading, error } = useSelector((state: RootState) => state.complaints);

  useEffect(() => {
    dispatch(fetchMetrics());
  }, [dispatch]);

  if (metricsLoading) return <CircularProgress sx={{ m: 5 }} />;
  if (error) return <Alert severity="error">{error}</Alert>;
  if (!metrics) return <Typography>No data</Typography>;

  const cards = [
    { label: 'Total Complaints', value: metrics.total || 0 },
    { label: 'Open', value: metrics.open || 0 },
    { label: 'In Progress', value: metrics.in_progress || 0 },
    { label: 'Resolved', value: metrics.resolved || 0 },
    { label: 'Critical Risk', value: metrics.critical || 0 },
  ];

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom>Dashboard</Typography>
      <Grid container spacing={3}>
        {cards.map((card) => (
          <Grid item xs={12} sm={6} md={2.4} key={card.label}>
            <Card>
              <CardContent>
                <Typography color="textSecondary" gutterBottom>{card.label}</Typography>
                <Typography variant="h4">{card.value}</Typography>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>
    </Box>
  );
};

export default Dashboard;