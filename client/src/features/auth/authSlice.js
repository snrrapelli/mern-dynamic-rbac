import {
    createAsyncThunk,
    createSlice,
} from '@reduxjs/toolkit';
import api from '../../api/axios';

export const loginUser = createAsyncThunk(
    'auth/loginUser',
    async (credentials, { rejectWithValue }) => {
        try {
            const response = await api.post('/auth/login', credentials);
            const { token } = response.data.data;

            localStorage.setItem('token', token);

            return response.data.data;
        } catch (error) {
            return rejectWithValue(
                error.response?.data?.message || 'Unable to log in'
            );
        }
    }
);

export const fetchMyProfile = createAsyncThunk(
    'auth/fetchMyProfile',
    async (_, { rejectWithValue }) => {
        try {
            const response = await api.get('/users/me');
            return response.data.data.user;
        } catch (error) {
            localStorage.removeItem('token');

            return rejectWithValue(
                error.response?.data?.message || 'Unable to fetch profile'
            );
        }
    }
);

const initialState = {
    user: null,
    token: localStorage.getItem('token'),
    permissions: [],
    isLoading: false,
    error: null,
    isAuthenticated: false,
};

const authSlice = createSlice({
    name: 'auth',
    initialState,
    reducers: {
        clearAuthError: (state) => {
            state.error = null;
        },
        logout: (state) => {
            localStorage.removeItem('token');
            state.user = null;
            state.token = null;
            state.permissions = [];
            state.isAuthenticated = false;
            state.error = null;
        },
    },
    extraReducers: (builder) => {
        builder
            .addCase(loginUser.pending, (state) => {
                state.isLoading = true;
                state.error = null;
            })
            .addCase(loginUser.fulfilled, (state, action) => {
                state.isLoading = false;
                state.user = action.payload.user;
                state.token = action.payload.token;
                state.isAuthenticated = true;
            })
            .addCase(loginUser.rejected, (state, action) => {
                state.isLoading = false;
                state.error = action.payload;
                state.isAuthenticated = false;
            })
            .addCase(fetchMyProfile.pending, (state) => {
                state.isLoading = true;
                state.error = null;
            })
            .addCase(fetchMyProfile.fulfilled, (state, action) => {
                state.isLoading = false;
                state.user = action.payload;
                state.permissions =
                    action.payload.role?.permissions
                        ?.filter((permission) => permission.isActive)
                        .map((permission) => permission.name) || [];
                state.isAuthenticated = true;
            })
            .addCase(fetchMyProfile.rejected, (state, action) => {
                state.isLoading = false;
                state.user = null;
                state.token = null;
                state.permissions = [];
                state.isAuthenticated = false;
                state.error = action.payload;
            });
    },
});

export const { clearAuthError, logout } = authSlice.actions;

export default authSlice.reducer;