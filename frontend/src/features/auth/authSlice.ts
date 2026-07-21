import {createAsyncThunk,createSlice} from '@reduxjs/toolkit'; import api from '../../api';
export type User={id:number;email:string;full_name:string;role:string};
export const fetchMe=createAsyncThunk('auth/me',async()=> (await api.get<User>('/auth/me')).data);
const slice=createSlice({name:'auth',initialState:{user:null as User|null,loading:false,error:''},reducers:{logout:s=>{s.user=null;localStorage.removeItem('token')}},extraReducers:b=>b.addCase(fetchMe.pending,s=>{s.loading=true}).addCase(fetchMe.fulfilled,(s,a)=>{s.user=a.payload;s.loading=false}).addCase(fetchMe.rejected,(s,a)=>{s.loading=false;s.error=a.error.message||'Unable to load user'})}); export const {logout}=slice.actions; export default slice.reducer;
