import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import api from '../../api/axios';

export const fetchPermissions = createAsyncThunk(
    'permissions/fetchPermissions',
    async (_, { rejectWithValue }) => {
        try {
            const response = await api.get('/permissions');
            return response.data.data.permissions;
        } catch (error) {
            return rejectWithValue(
                error.response?.data?.message ||
                'Unable to fetch permissions'
            );
        }
    }
);

export const createPermission = createAsyncThunk(
    'permissions/createPermission',
    async (permissionData, { rejectWithValue }) => {
        try {
            const response = await api.post(
                '/permissions',
                permissionData
            );

            return {
                permission: response.data.data.permission,
                message: response.data.message,
            };
        } catch (error) {
            return rejectWithValue(
                error.response?.data?.message ||
                'Unable to create permission'
            );
        }
    }
);

export const updatePermission = createAsyncThunk(
    'permissions/updatePermission',
    async ({ permissionId, permissionData }, { rejectWithValue }) => {
        try {
            const response = await api.patch(
                `/permissions/${permissionId}`,
                permissionData
            );

            return {
                permission: response.data.data.permission,
                message: response.data.message,
            };
        } catch (error) {
            return rejectWithValue(
                error.response?.data?.message ||
                'Unable to update permission'
            );
        }
    }
);

export const deletePermission = createAsyncThunk(
    'permissions/deletePermission',
    async (permissionId, { rejectWithValue }) => {
        try {
            const response = await api.delete(
                `/permissions/${permissionId}`
            );

            return {
                permissionId,
                message: response.data.message,
            };
        } catch (error) {
            return rejectWithValue(
                error.response?.data?.message ||
                'Unable to delete permission'
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

const permissionSlice = createSlice({
    name: 'permissions',
    initialState,
    reducers: {
        clearPermissionError: (state) => {
            state.error = null;
        },
    },
    extraReducers: (builder) => {
        builder
            .addCase(fetchPermissions.pending, (state) => {
                state.isLoading = true;
                state.error = null;
            })
            .addCase(fetchPermissions.fulfilled, (state, action) => {
                state.isLoading = false;
                state.items = action.payload;
            })
            .addCase(fetchPermissions.rejected, (state, action) => {
                state.isLoading = false;
                state.error = action.payload;
            })
            .addCase(createPermission.pending, (state) => {
                state.isSubmitting = true;
                state.error = null;
            })
            .addCase(createPermission.fulfilled, (state, action) => {
                state.isSubmitting = false;
                state.items.push(action.payload.permission);
            })
            .addCase(createPermission.rejected, (state, action) => {
                state.isSubmitting = false;
                state.error = action.payload;
            })
            .addCase(updatePermission.pending, (state) => {
                state.isSubmitting = true;
                state.error = null;
            })
            .addCase(updatePermission.fulfilled, (state, action) => {
                state.isSubmitting = false;

                const index = state.items.findIndex(
                    (item) => item._id === action.payload.permission._id
                );

                if (index !== -1) {
                    state.items[index] = action.payload.permission;
                }
            })
            .addCase(updatePermission.rejected, (state, action) => {
                state.isSubmitting = false;
                state.error = action.payload;
            })
            .addCase(deletePermission.pending, (state) => {
                state.isDeleting = true;
                state.error = null;
            })
            .addCase(deletePermission.fulfilled, (state, action) => {
                state.isDeleting = false;
                state.items = state.items.filter(
                    (item) => item._id !== action.payload.permissionId
                );
            })
            .addCase(deletePermission.rejected, (state, action) => {
                state.isDeleting = false;
                state.error = action.payload;
            });
    },
});

export const { clearPermissionError } = permissionSlice.actions;

export default permissionSlice.reducer;