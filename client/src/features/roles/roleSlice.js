import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import api from '../../api/axios';

export const fetchRoles = createAsyncThunk(
    'roles/fetchRoles',
    async (_, { rejectWithValue }) => {
        try {
            const response = await api.get('/roles');
            return response.data.data.roles;
        } catch (error) {
            return rejectWithValue(
                error.response?.data?.message ||
                'Unable to fetch roles'
            );
        }
    }
);

export const createRole = createAsyncThunk(
    'roles/createRole',
    async (roleData, { rejectWithValue }) => {
        try {
            const response = await api.post('/roles', roleData);

            return {
                role: response.data.data.role,
                message: response.data.message,
            };
        } catch (error) {
            return rejectWithValue(
                error.response?.data?.message ||
                'Unable to create role'
            );
        }
    }
);

export const updateRole = createAsyncThunk(
    'roles/updateRole',
    async ({ roleId, roleData }, { rejectWithValue }) => {
        try {
            const response = await api.patch(
                `/roles/${roleId}`,
                roleData
            );

            return {
                role: response.data.data.role,
                message: response.data.message,
            };
        } catch (error) {
            return rejectWithValue(
                error.response?.data?.message ||
                'Unable to update role'
            );
        }
    }
);

export const deleteRole = createAsyncThunk(
    'roles/deleteRole',
    async (roleId, { rejectWithValue }) => {
        try {
            const response = await api.delete(`/roles/${roleId}`);

            return {
                roleId,
                message: response.data.message,
            };
        } catch (error) {
            return rejectWithValue(
                error.response?.data?.message ||
                'Unable to delete role'
            );
        }
    }
);

export const fetchRoleOptions = createAsyncThunk(
    'roles/fetchRoleOptions',
    async (_, { rejectWithValue }) => {
        try {
            const response = await api.get('/roles/options');

            return response.data.data.roles;
        } catch (error) {
            return rejectWithValue(
                error.response?.data?.message ||
                'Unable to fetch role options'
            );
        }
    }
);

const initialState = {
    items: [],
    roleOptions: [],
    isLoading: false,
    isLoadingOptions: false,
    isSubmitting: false,
    isDeleting: false,
    error: null,
    optionsError: null,
};

const roleSlice = createSlice({
    name: 'roles',
    initialState,
    reducers: {
        clearRoleError: (state) => {
            state.error = null;
        },
        clearRoleOptionsError: (state) => {
            state.optionsError = null;
        },
    },
    extraReducers: (builder) => {
        builder
            .addCase(fetchRoles.pending, (state) => {
                state.isLoading = true;
                state.error = null;
            })
            .addCase(fetchRoles.fulfilled, (state, action) => {
                state.isLoading = false;
                state.items = action.payload;
            })
            .addCase(fetchRoles.rejected, (state, action) => {
                state.isLoading = false;
                state.error = action.payload;
            })
            .addCase(createRole.pending, (state) => {
                state.isSubmitting = true;
                state.error = null;
            })
            .addCase(createRole.fulfilled, (state, action) => {
                state.isSubmitting = false;
                state.items.push(action.payload.role);
                state.items.sort((a, b) => a.name.localeCompare(b.name));
            })
            .addCase(createRole.rejected, (state, action) => {
                state.isSubmitting = false;
                state.error = action.payload;
            })
            .addCase(updateRole.pending, (state) => {
                state.isSubmitting = true;
                state.error = null;
            })
            .addCase(updateRole.fulfilled, (state, action) => {
                state.isSubmitting = false;

                const index = state.items.findIndex(
                    (role) => role._id === action.payload.role._id
                );

                if (index !== -1) {
                    state.items[index] = action.payload.role;
                }

                state.items.sort((a, b) => a.name.localeCompare(b.name));
            })
            .addCase(updateRole.rejected, (state, action) => {
                state.isSubmitting = false;
                state.error = action.payload;
            })
            .addCase(deleteRole.pending, (state) => {
                state.isDeleting = true;
                state.error = null;
            })
            .addCase(deleteRole.fulfilled, (state, action) => {
                state.isDeleting = false;
                state.items = state.items.filter(
                    (role) => role._id !== action.payload.roleId
                );
            })
            .addCase(deleteRole.rejected, (state, action) => {
                state.isDeleting = false;
                state.error = action.payload;
            })
            .addCase(fetchRoleOptions.pending, (state) => {
                state.isLoadingOptions = true;
                state.optionsError = null;
            })
            .addCase(fetchRoleOptions.fulfilled, (state, action) => {
                state.isLoadingOptions = false;
                state.roleOptions = action.payload;
            })
            .addCase(fetchRoleOptions.rejected, (state, action) => {
                state.isLoadingOptions = false;
                state.optionsError = action.payload;
            });

    },
});

export const { clearRoleError, clearRoleOptionsError } = roleSlice.actions;

export default roleSlice.reducer;