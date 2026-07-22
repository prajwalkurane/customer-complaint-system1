import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../api';

export const fetchMetrics = createAsyncThunk(
  'complaints/fetchMetrics',
  async () => {
    const response = await api.get('/dashboard/metrics');
    return response.data;
  }
);

export const fetchComplaints = createAsyncThunk(
  'complaints/fetchComplaints',
  async () => {
    const response = await api.get('/complaints');
    return response.data;
  }
);

export const extractComplaint = createAsyncThunk(
  'complaints/extract',
  async ({ file, text }: { file?: File; text?: string }) => {
    const formData = new FormData();
    if (file) formData.append('file', file);
    if (text) formData.append('text', text);
    const response = await api.post('/complaints/extract', formData);
    return response.data;
  }
);

export const createComplaint = createAsyncThunk(
  'complaints/create',
  async (data: any) => {
    const response = await api.post('/complaints', data);
    return response.data;
  }
);

interface ComplaintState {
  items: any[];
  metrics: any | null;
  loading: boolean;
  metricsLoading: boolean;
  error: string | null;
}

const initialState: ComplaintState = {
  items: [],
  metrics: null,
  loading: false,
  metricsLoading: false,
  error: null,
};

const complaintSlice = createSlice({
  name: 'complaints',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchMetrics.pending, (state) => { state.metricsLoading = true; state.error = null; })
      .addCase(fetchMetrics.fulfilled, (state, action) => {
        state.metricsLoading = false;
        state.metrics = action.payload ?? null;
      })
      .addCase(fetchMetrics.rejected, (state, action) => {
        state.metricsLoading = false;
        state.error = action.error.message || 'Failed to fetch metrics';
      })
      .addCase(fetchComplaints.pending, (state) => { state.loading = true; state.error = null; })
      .addCase(fetchComplaints.fulfilled, (state, action) => {
        state.loading = false;
        state.items = action.payload ?? [];
      })
      .addCase(fetchComplaints.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to fetch complaints';
      })
      .addCase(extractComplaint.pending, (state) => { state.loading = true; })
      .addCase(extractComplaint.fulfilled, (state) => {
        state.loading = false;
      })
      .addCase(extractComplaint.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Extraction failed';
      })
      .addCase(createComplaint.pending, (state) => { state.loading = true; })
      .addCase(createComplaint.fulfilled, (state) => {
        state.loading = false;
      })
      .addCase(createComplaint.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Creation failed';
      });
  }
});

export default complaintSlice.reducer;