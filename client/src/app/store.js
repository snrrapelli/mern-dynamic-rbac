import { configureStore } from '@reduxjs/toolkit';
import authReducer from '../features/auth/authSlice';
import permissionReducer from '../features/permissions/permissionSlice';
import roleReducer from '../features/roles/roleSlice';
import userReducer from '../features/users/userSlice';
import { use } from 'react';

export const store = configureStore({
    reducer: {
        auth: authReducer,
        permissions: permissionReducer,
        roles: roleReducer,
        users: userReducer,
    },
});