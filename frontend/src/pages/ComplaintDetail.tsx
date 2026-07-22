import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import {
  Box, Paper, Typography, Grid, Chip, Divider, Button,
  CircularProgress, Alert, Dialog, DialogTitle, DialogContent,
  DialogActions, TextField, MenuItem, Table, TableBody, TableCell,
  TableContainer, TableHead, TableRow
} from '@mui/material';
import { RootState, AppDispatch } from '../store';
import {
  fetchComplaintById,
  fetchTimeline,
  updateComplaint,
  deleteComplaint
} from '../store/complaintSlice';
import Layout from '../components/Layout';

const statuses = ['Open', 'In Progress', 'Resolved', 'Closed'];
const priorities = ['Low', 'Medium', 'High', 'Critical'];

const ComplaintDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const dispatch = useDispatch<AppDispatch>();
  const { currentComplaint, timeline, loading, error } = useSelector((state: RootState) => state.complaints);
  const user = useSelector((state: RootState) => state.auth.user);
  const isAdmin = user?.role === 'admin' || user?.role === 'manager';

  const [editOpen, setEditOpen] = useState(false);
  const [editData, setEditData] = useState<any>({});

  useEffect(() => {
    if (id) {
      dispatch(fetchComplaintById(parseInt(id)));
      dispatch(fetchTimeline(parseInt(id)));
    }
  }, [dispatch, id]);

  if (loading) return <Layout><CircularProgress /></Layout>;
  if (error) return <Layout><Alert severity="error">{error}</Alert></Layout>;
  if (!currentComplaint) return <Layout><Typography>Complaint not found</Typography></Layout>;

  const c = currentComplaint;

  const handleEditOpen = () => {
    setEditData({ status: c.status, priority: c.priority, description: c.description });
    setEditOpen(true);
  };

  const handleEditSave = async () => {
    await dispatch(updateComplaint({ id: c.id, data: editData }));
    setEditOpen(false);
    dispatch(fetchComplaintById(c.id));
  };

  const handleDelete = async () => {
    if (window.confirm('Are you sure you want to delete this complaint?')) {
      await dispatch(deleteComplaint(c.id));
      navigate('/complaints');
    }
  };

  return (
    <Layout>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
        <Typography variant="h4">{c.reference}</Typography>
        <Box>
          {isAdmin && (
            <>
              <Button variant="outlined" onClick={handleEditOpen} sx={{ mr: 1 }}>Edit</Button>
              <Button variant="contained" color="error" onClick={handleDelete}>Delete</Button>
            </>
          )}
        </Box>
      </Box>

      <Grid container spacing={3}>
        <Grid item xs={12} md={8}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>Details</Typography>
            <Grid container spacing={2}>
              <Grid item xs={6}><Typography variant="subtitle2">Title</Typography><Typography>{c.title}</Typography></Grid>
              <Grid item xs={6}><Typography variant="subtitle2">Customer</Typography><Typography>{c.customer_name} ({c.customer_email})</Typography></Grid>
              <Grid item xs={6}><Typography variant="subtitle2">Status</Typography><Chip label={c.status} /></Grid>
              <Grid item xs={6}><Typography variant="subtitle2">Priority</Typography><Chip label={c.priority} /></Grid>
              <Grid item xs={12}><Typography variant="subtitle2">Description</Typography><Typography>{c.description}</Typography></Grid>
            </Grid>
          </Paper>

          <Paper sx={{ p: 3, mt: 3 }}>
            <Typography variant="h6" gutterBottom>AI Analysis</Typography>
            <Grid container spacing={2}>
              <Grid item xs={12}><Typography variant="subtitle2">Summary</Typography><Typography>{c.ai_summary || 'Pending'}</Typography></Grid>
              <Grid item xs={6}><Typography variant="subtitle2">Risk</Typography><Chip label={c.risk_level || 'Pending'} /></Grid>
              <Grid item xs={6}><Typography variant="subtitle2">Root Cause</Typography><Typography>{c.root_cause || 'Pending'}</Typography></Grid>
              <Grid item xs={12}><Typography variant="subtitle2">CAPA Recommendation</Typography><Typography>{c.capa_recommendation || 'Pending'}</Typography></Grid>
            </Grid>
          </Paper>
        </Grid>

        <Grid item xs={12} md={4}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>Timeline</Typography>
            {timeline?.map((event: any) => (
              <Box key={event.id} sx={{ borderLeft: 2, borderColor: 'primary.main', pl: 2, py: 1 }}>
                <Typography variant="body2"><b>{event.action}</b></Typography>
                <Typography variant="caption" color="textSecondary">{event.detail}</Typography>
                <br />
                <Typography variant="caption" color="textSecondary">{new Date(event.created_at).toLocaleString()}</Typography>
              </Box>
            ))}
            {(!timeline || timeline.length === 0) && <Typography>No events yet</Typography>}
          </Paper>

          {c.attachments && c.attachments.length > 0 && (
            <Paper sx={{ p: 3, mt: 3 }}>
              <Typography variant="h6" gutterBottom>Attachments</Typography>
              {c.attachments.map((a: any) => (
                <Typography key={a.id} variant="body2">{a.filename}</Typography>
              ))}
            </Paper>
          )}
        </Grid>
      </Grid>

      {/* Edit Dialog */}
      <Dialog open={editOpen} onClose={() => setEditOpen(false)} fullWidth>
        <DialogTitle>Edit Complaint</DialogTitle>
        <DialogContent>
          <TextField
            select fullWidth label="Status" margin="normal"
            value={editData.status} onChange={(e) => setEditData({ ...editData, status: e.target.value })}
          >
            {statuses.map(s => <MenuItem key={s} value={s}>{s}</MenuItem>)}
          </TextField>
          <TextField
            select fullWidth label="Priority" margin="normal"
            value={editData.priority} onChange={(e) => setEditData({ ...editData, priority: e.target.value })}
          >
            {priorities.map(p => <MenuItem key={p} value={p}>{p}</MenuItem>)}
          </TextField>
          <TextField
            fullWidth multiline rows={4} label="Description" margin="normal"
            value={editData.description} onChange={(e) => setEditData({ ...editData, description: e.target.value })}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setEditOpen(false)}>Cancel</Button>
          <Button variant="contained" onClick={handleEditSave}>Save</Button>
        </DialogActions>
      </Dialog>
    </Layout>
  );
};

export default ComplaintDetail;