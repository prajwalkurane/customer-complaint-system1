import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Box, Grid, Card, CardContent, Typography, Paper, CircularProgress, Alert } from '@mui/material';
import { RootState } from '../store';
import { fetchMetrics } from '../store/complaintSlice';
import { AppDispatch } from '../store';

const Dashboard = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { metrics, metricsLoading, error } = useSelector((state: RootState) => state.complaints);

  useEffect(() => {
    dispatch(fetchMetrics());
  }, [dispatch]);

  if (metricsLoading) return <CircularProgress sx={{ m: 5 }} />;
  if (error) return <Alert severity="error">{error}</Alert>;
  if (!metrics) return <Typography>No data</Typography>;

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom>Dashboard</Typography>
      <Grid container spacing={3}>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Typography color="textSecondary" gutterBottom>Total Complaints</Typography>
              <Typography variant="h5">{metrics.total || 0}</Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Typography color="textSecondary" gutterBottom>Open</Typography>
              <Typography variant="h5">{metrics.open || 0}</Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Typography color="textSecondary" gutterBottom>In Progress</Typography>
              <Typography variant="h5">{metrics.in_progress || 0}</Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Typography color="textSecondary" gutterBottom>Closed</Typography>
              <Typography variant="h5">{metrics.closed || 0}</Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
};

export default Dashboard;