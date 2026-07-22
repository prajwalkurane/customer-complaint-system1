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
  currentComplaint: any | null;     
  timeline: any[];                   
  auditLogs: any[];                  
  metrics: any | null;
  loading: boolean;
  metricsLoading: boolean;
  error: string | null;
}

const initialState: ComplaintState = {
  items: [],
   currentComplaint: null,
  timeline: [],
  auditLogs: [],
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
      builder

  // fetchComplaintById
  .addCase(fetchComplaintById.pending, (state) => { state.loading = true; })
  .addCase(fetchComplaintById.fulfilled, (state, action) => {
    state.loading = false;
    state.currentComplaint = action.payload;
  })
  .addCase(fetchComplaintById.rejected, (state, action) => {
    state.loading = false;
    state.error = action.error.message || 'Failed to fetch complaint';
  })

  // fetchTimeline
  .addCase(fetchTimeline.fulfilled, (state, action) => {
    state.timeline = action.payload.events;
  })
  .addCase(fetchTimeline.rejected, (state, action) => {
    state.error = action.error.message || 'Failed to fetch timeline';
  })

  // fetchAuditLogs
  .addCase(fetchAuditLogs.pending, (state) => { state.loading = true; })
  .addCase(fetchAuditLogs.fulfilled, (state, action) => {
    state.loading = false;
    state.auditLogs = action.payload;
  })
  .addCase(fetchAuditLogs.rejected, (state, action) => {
    state.loading = false;
    state.error = action.error.message || 'Failed to fetch audit logs';
  })

  // updateComplaint
  .addCase(updateComplaint.fulfilled, (state, action) => {
    state.currentComplaint = action.payload;
    // also update in items list if needed
    const idx = state.items.findIndex(i => i.id === action.payload.id);
    if (idx !== -1) state.items[idx] = action.payload;
  })

  // deleteComplaint
  .addCase(deleteComplaint.fulfilled, (state, action) => {
    state.items = state.items.filter(i => i.id !== action.payload);
    state.currentComplaint = null;
  });
  }
});



// Add these to existing complaintSlice.ts

export const fetchComplaintById = createAsyncThunk(
  'complaints/fetchById',
  async (id: number) => {
    const response = await api.get(`/complaints/${id}`);
    return response.data;
  }
);

export const updateComplaint = createAsyncThunk(
  'complaints/update',
  async ({ id, data }: { id: number; data: any }) => {
    const response = await api.patch(`/complaints/${id}`, data);
    return response.data;
  }
);

export const deleteComplaint = createAsyncThunk(
  'complaints/delete',
  async (id: number) => {
    await api.delete(`/complaints/${id}`);
    return id;
  }
);

export const fetchTimeline = createAsyncThunk(
  'complaints/fetchTimeline',
  async (id: number) => {
    const response = await api.get(`/complaints/${id}/timeline`);
    return { id, events: response.data };
  }
);

export const fetchAuditLogs = createAsyncThunk(
  'complaints/fetchAuditLogs',
  async () => {
    const response = await api.get('/complaints/audit/logs');
    return response.data;
  }
);

export default complaintSlice.reducer;