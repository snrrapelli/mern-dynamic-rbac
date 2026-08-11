import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import api from '../../api/axios';

export const fetchUsers = createAsyncThunk(
    'users/fetchUsers',
    async (_, { rejectWithValue }) => {
        try {
            const response = await api.get('/users');

            return response.data.data.users;
        } catch (error) {
            return rejectWithValue(
                error.response?.data?.message ||
                'Unable to fetch users'
            );
        }
    }
);

export const createUser = createAsyncThunk(
    'users/createUser',
    async (userData, { rejectWithValue }) => {
        try {
            const response = await api.post('/users', userData);

            return {
                user: response.data.data.user,
                message: response.data.message,
            };
        } catch (error) {
            return rejectWithValue(
                error.response?.data?.message ||
                'Unable to create user'
            );
        }
    }
);

export const updateUser = createAsyncThunk(
    'users/updateUser',
    async ({ userId, userData }, { rejectWithValue }) => {
        try {
            const response = await api.patch(
                `/users/${userId}`,
                userData
            );

            return {
                user: response.data.data.user,
                message: response.data.message,
            };
        } catch (error) {
            return rejectWithValue(
                error.response?.data?.message ||
                'Unable to update user'
            );
        }
    }
);

export const deleteUser = createAsyncThunk(
    'users/deleteUser',
    async (userId, { rejectWithValue }) => {
        try {
            const response = await api.delete(`/users/${userId}`);

            return {
                userId,
                message: response.data.message,
            };
        } catch (error) {
            return rejectWithValue(
                error.response?.data?.message ||
                'Unable to delete user'
            );
        }
    }
);

const initialState = {
    items: [],
    isLoading: false,
    isSubmitting: false,
    isDeleting: false,
    error: null,
};

const userSlice = createSlice({
    name: 'users',
    initialState,
    reducers: {
        clearUserError: (state) => {
            state.error = null;
        },
    },
    extraReducers: (builder) => {
        builder
            .addCase(fetchUsers.pending, (state) => {
                state.isLoading = true;
                state.error = null;
            })
            .addCase(fetchUsers.fulfilled, (state, action) => {
                state.isLoading = false;
                state.items = action.payload;
            })
            .addCase(fetchUsers.rejected, (state, action) => {
                state.isLoading = false;
                state.error = action.payload;
            })
            .addCase(createUser.pending, (state) => {
                state.isSubmitting = true;
                state.error = null;
            })
            .addCase(createUser.fulfilled, (state, action) => {
                state.isSubmitting = false;
                state.items.unshift(action.payload.user);
            })
            .addCase(createUser.rejected, (state, action) => {
                state.isSubmitting = false;
                state.error = action.payload;
            })
            .addCase(updateUser.pending, (state) => {
                state.isSubmitting = true;
                state.error = null;
            })
            .addCase(updateUser.fulfilled, (state, action) => {
                state.isSubmitting = false;

                const index = state.items.findIndex(
                    (user) => user._id === action.payload.user._id
                );

                if (index !== -1) {
                    state.items[index] = action.payload.user;
                }
            })
            .addCase(updateUser.rejected, (state, action) => {
                state.isSubmitting = false;
                state.error = action.payload;
            })
            .addCase(deleteUser.pending, (state) => {
                state.isDeleting = true;
                state.error = null;
            })
            .addCase(deleteUser.fulfilled, (state, action) => {
                state.isDeleting = false;
                state.items = state.items.filter(
                    (user) => user._id !== action.payload.userId
                );
            })
            .addCase(deleteUser.rejected, (state, action) => {
                state.isDeleting = false;
                state.error = action.payload;
            });
    },
});

export const { clearUserError } = userSlice.actions;

export default userSlice.reducer;