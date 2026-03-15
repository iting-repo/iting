import { createSlice } from '@reduxjs/toolkit';

const initialState = {
    profile: null,
    isLoading: false,
    error: null,
};

const companySlice = createSlice({
    name: 'company',
    initialState,
    reducers: {
        fetchCompanyRequest: (state) => {
            state.isLoading = true;
            state.error = null;
        },
        fetchCompanySuccess: (state, action) => {
            state.isLoading = false;
            state.profile = action.payload;
            state.error = null;
        },
        fetchCompanyFailure: (state, action) => {
            state.isLoading = false;
            state.error = action.payload;
        },
        clearCompanyProfile: (state) => {
            state.profile = null;
            state.error = null;
        }
    },
});

export const {
    fetchCompanyRequest,
    fetchCompanySuccess,
    fetchCompanyFailure,
    clearCompanyProfile
} = companySlice.actions;

export default companySlice.reducer;
