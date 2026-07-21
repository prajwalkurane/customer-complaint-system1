import {configureStore} from '@reduxjs/toolkit'; import complaints from './features/complaints/complaintSlice'; import auth from './features/auth/authSlice';
export {fetchComplaints,fetchMetrics} from './features/complaints/complaintSlice'; export const store=configureStore({reducer:{complaints,auth}}); export type RootState=ReturnType<typeof store.getState>;
