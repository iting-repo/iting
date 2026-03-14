import { createSlice } from '@reduxjs/toolkit';

const initialState = {
    jobs: [],           // Danh sách công việc
    totalJobs: 0,       // Tổng số công việc (để phân trang)
    currentJob: null,   // Chi tiết công việc đang xem
    isLoading: false,
    error: null,
};

const jobSlice = createSlice({
    name: 'job',
    initialState,
    reducers: {
        // --- LIST JOBS ---
        fetchJobsRequest: (state) => {
            state.isLoading = true;
            state.error = null;
        },
        fetchJobsSuccess: (state, action) => {
            state.isLoading = false;
            // Giả sử API trả về { data: [], total: 100 } hoặc tùy cấu trúc
            // Ở đây ta cứ gán linh động để Saga xử lý payload chuẩn
            state.jobs = action.payload.content || action.payload;
            state.totalJobs = action.payload.totalElements || action.payload.length || 0;
        },
        fetchJobsFailure: (state, action) => {
            state.isLoading = false;
            state.error = action.payload;
        },

        fetchLatestJobsRequest: (state) => {
            state.isLoading = true;
            state.error = null;
        },

        fetchLatestJobsSuccess: (state, action) => {
            state.isLoading = false;
            state.error = action.payload || [];
        },

        fetchLatestJobsFailure: (state, action) => {
            state.isLoading = false;
            state.error = action.payload;
        },
        

        // --- JOB DETAIL ---
        fetchJobDetailRequest: (state) => {
            state.isLoading = true;
            state.error = null;
            state.currentJob = null; // Reset trước khi load mới
        },
        fetchJobDetailSuccess: (state, action) => {
            state.isLoading = false;
            state.currentJob = action.payload;
        },
        fetchJobDetailFailure: (state, action) => {
            state.isLoading = false;
            state.error = action.payload;
        }
    }
});

export const {
    fetchJobsRequest, fetchJobsSuccess, fetchJobsFailure,

    fetchLatestJobsRequest, fetchLatestJobsSuccess, fetchLatestJobsFailure,

    fetchJobDetailRequest, fetchJobDetailSuccess, fetchJobDetailFailure
} = jobSlice.actions;

export default jobSlice.reducer;
