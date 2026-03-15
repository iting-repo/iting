import { createSlice } from '@reduxjs/toolkit';

const initialState = {
    applications: [],       // Danh sách ứng viên
    totalApplications: 0,   // Tổng số ứng viên
    isLoading: false,
    error: null,
};

const applicationSlice = createSlice({
    name: 'application',
    initialState,
    reducers: {
        fetchApplicationsRequest: (state) => {
            state.isLoading = true;
            state.error = null;
        },
        fetchApplicationsSuccess: (state, action) => {
            state.isLoading = false;
            state.applications = action.payload.content || [];
            state.totalApplications = action.payload.totalElements || 0;
        },
        fetchApplicationsFailure: (state, action) => {
            state.isLoading = false;
            state.error = action.payload;
        },
        resetApplications: (state) => {
            state.applications = [];
            state.totalApplications = 0;
            state.error = null;
        }
    }
});

export const {
    fetchApplicationsRequest, fetchApplicationsSuccess, fetchApplicationsFailure, resetApplications
} = applicationSlice.actions;

export default applicationSlice.reducer;
