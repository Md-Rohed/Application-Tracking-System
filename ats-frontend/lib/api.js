import axios from 'axios';
import { getToken } from './auth';

const api = axios.create({
    baseURL: process.env.NEXT_PUBLIC_API_URL,
    headers: { 'Content-Type': 'application/json' },
});

api.interceptors.request.use((config) => {
    const token = getToken();
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

export const signup = (data) => api.post('/api/auth/signup', data).then(res => res.data);
export const login = (data) => api.post('/api/auth/login', data).then(res => res.data);
export const getJobs = () => api.get('/api/jobs').then(res => res.data);
export const getJobsById = (id) => api.get(`/api/jobs/${id}`).then(res => res.data);
export const createJob = (data) => api.post('/api/jobs', data).then(res => res.data);
export const applyForJob = (data, config) => api.post('/api/applications', data, config).then(res => res.data);
export const getApplications = () => api.get('/api/applications').then(res => res.data);
export const updateApplicationStatus = (id, status) => api.patch(`/api/applications/${id}`, { status }).then(res => res.data);
export const downloadResume = (id) => api.get(`/api/resumes/${id}`, { responseType: 'blob' }).then(res => res.data);