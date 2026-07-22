import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../api'; // तुमच्या api client च्या path नुसार

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

const initialState = {
  complaints: [],
  loading: false,
  error: null,
};

const complaintSlice = createSlice({
  name: 'complaints',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(extractComplaint.pending, (state) => {
        state.loading = true;
      })
      .addCase(extractComplaint.fulfilled, (state, action) => {
        state.loading = false;
        // handle extracted data
      })
      .addCase(extractComplaint.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message;
      });
  },
});

export default complaintSlice.reducer;