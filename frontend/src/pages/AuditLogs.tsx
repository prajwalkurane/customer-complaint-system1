import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
  Paper, TextField, Box, Typography, CircularProgress, Alert
} from '@mui/material';
import { RootState, AppDispatch } from '../store';
import { fetchAuditLogs } from '../store/complaintSlice';
import Layout from '../components/Layout';

const AuditLogs = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { auditLogs, loading, error } = useSelector((state: RootState) => state.complaints);
  const [search, setSearch] = useState('');

  useEffect(() => {
    dispatch(fetchAuditLogs());
  }, [dispatch]);

  const filtered = (auditLogs || []).filter((log: any) =>
    log.user_email?.toLowerCase().includes(search.toLowerCase()) ||
    log.action?.toLowerCase().includes(search.toLowerCase())
  );

  if (loading) return <Layout><CircularProgress /></Layout>;
  if (error) return <Layout><Alert severity="error">{error}</Alert></Layout>;

  return (
    <Layout>
      <Typography variant="h4" gutterBottom>Audit Logs</Typography>
      <TextField
        placeholder="Search by user or action"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        size="small"
        sx={{ mb: 2, width: 300 }}
      />
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>User</TableCell>
              <TableCell>Action</TableCell>
              <TableCell>Detail</TableCell>
              <TableCell>Timestamp</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {filtered.map((log: any) => (
              <TableRow key={log.id}>
                <TableCell>{log.user_email}</TableCell>
                <TableCell>{log.action}</TableCell>
                <TableCell>{log.detail}</TableCell>
                <TableCell>{new Date(log.created_at).toLocaleString()}</TableCell>
              </TableRow>
            ))}
            {filtered.length === 0 && (
              <TableRow><TableCell colSpan={4} align="center">No logs found</TableCell></TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>
    </Layout>
  );
};

export default AuditLogs;