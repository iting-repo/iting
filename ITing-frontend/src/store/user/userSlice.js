import { createSlice } from '@reduxjs/toolkit';

const initialState = {
    profile: null,
    isLoading: false,
    error: null,
};

const userSlice = createSlice({
    name: 'user',
    initialState,
    reducers: {
        fetchProfileRequest: (state) => {
            state.isLoading = true;
            state.error = null;
        },
        fetchProfileSuccess: (state, action) => {
            state.isLoading = false;
            state.profile = action.payload;
            state.error = null;
        },
        fetchProfileFailure: (state, action) => {
            state.isLoading = false;
            state.error = action.payload;
        },
        // Clear profile data on logout
        clearProfile: (state) => {
            state.profile = null;
            state.error = null;
        }
    },
});

export const {
    fetchProfileRequest,
    fetchProfileSuccess,
    fetchProfileFailure,
    clearProfile
} = userSlice.actions;

export default userSlice.reducer;
