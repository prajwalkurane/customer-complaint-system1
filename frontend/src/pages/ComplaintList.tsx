import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import {
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
  Paper, TextField, MenuItem, Select, Chip, Box, Typography,
  Pagination, CircularProgress, Alert, InputAdornment
} from '@mui/material';
import { Search } from '@mui/icons-material';
import { RootState, AppDispatch } from '../store';
import { fetchComplaints } from '../store/complaintSlice';
import Layout from '../components/Layout';

const statuses = ['All', 'Open', 'In Progress', 'Resolved', 'Closed'];

const ComplaintList = () => {
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();
  const { items, loading, error } = useSelector((state: RootState) => state.complaints);
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('All');
  const [page, setPage] = useState(1);
  const rowsPerPage = 10;

  useEffect(() => {
    dispatch(fetchComplaints());
  }, [dispatch]);

  // Filter items
  const filtered = items.filter(c => {
    const matchSearch = 
      c.reference?.toLowerCase().includes(search.toLowerCase()) ||
      c.title?.toLowerCase().includes(search.toLowerCase()) ||
      c.customer_name?.toLowerCase().includes(search.toLowerCase());
    const matchStatus = status === 'All' || c.status === status;
    return matchSearch && matchStatus;
  });

  // Paginate
  const start = (page - 1) * rowsPerPage;
  const paginated = filtered.slice(start, start + rowsPerPage);

  if (loading) return <Layout><CircularProgress /></Layout>;
  if (error) return <Layout><Alert severity="error">{error}</Alert></Layout>;

  return (
    <Layout>
      <Typography variant="h4" gutterBottom>Complaints</Typography>
      <Box display="flex" gap={2} mb={2}>
        <TextField
          placeholder="Search by reference, title, customer..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          size="small"
          InputProps={{ startAdornment: <InputAdornment position="start"><Search /></InputAdornment> }}
          sx={{ flexGrow: 1 }}
        />
        <Select
          value={status}
          onChange={(e) => setStatus(e.target.value)}
          size="small"
          sx={{ minWidth: 150 }}
        >
          {statuses.map(s => <MenuItem key={s} value={s}>{s}</MenuItem>)}
        </Select>
      </Box>

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Reference</TableCell>
              <TableCell>Title / Customer</TableCell>
              <TableCell>Status</TableCell>
              <TableCell>Risk</TableCell>
              <TableCell>Priority</TableCell>
              <TableCell>Date</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {paginated.map(c => (
              <TableRow
                key={c.id}
                hover
                onClick={() => navigate(`/complaints/${c.id}`)}
                sx={{ cursor: 'pointer' }}
              >
                <TableCell>{c.reference}</TableCell>
                <TableCell>
                  <Typography variant="body2">{c.title}</Typography>
                  <Typography variant="caption" color="textSecondary">{c.customer_name}</Typography>
                </TableCell>
                <TableCell><Chip label={c.status} size="small" color={c.status === 'Open' ? 'error' : c.status === 'In Progress' ? 'warning' : 'success'} /></TableCell>
                <TableCell><Chip label={c.risk_level} size="small" color={c.risk_level === 'Critical' ? 'error' : c.risk_level === 'High' ? 'warning' : 'info'} /></TableCell>
                <TableCell>{c.priority}</TableCell>
                <TableCell>{new Date(c.created_at).toLocaleDateString()}</TableCell>
              </TableRow>
            ))}
            {paginated.length === 0 && (
              <TableRow>
                <TableCell colSpan={6} align="center">No complaints found</TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>

      <Box display="flex" justifyContent="center" mt={2}>
        <Pagination
          count={Math.ceil(filtered.length / rowsPerPage)}
          page={page}
          onChange={(_, v) => setPage(v)}
          color="primary"
        />
      </Box>
    </Layout>
  );
};

export default ComplaintList;