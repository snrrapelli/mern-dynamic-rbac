import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import {
    Alert,
    Box,
    Button,
    CircularProgress,
    Paper,
    TextField,
    Typography,
} from '@mui/material';
import {
    clearAuthError,
    fetchMyProfile,
    loginUser,
} from '../features/auth/authSlice';

const loginSchema = yup.object({
    email: yup
        .string()
        .trim()
        .email('Enter a valid email address')
        .required('Email is required'),
    password: yup
        .string()
        .required('Password is required'),
});

const LoginPage = () => {
    const dispatch = useDispatch();

    const { isLoading, error, isAuthenticated, user, permissions } =
        useSelector((state) => state.auth);

    const {
        register,
        handleSubmit,
        formState: { errors },
    } = useForm({
        resolver: yupResolver(loginSchema),
        defaultValues: {
            email: '',
            password: '',
        },
    });

    useEffect(() => {
        return () => {
            dispatch(clearAuthError());
        };
    }, [dispatch]);

    const onSubmit = async (credentials) => {
        const result = await dispatch(loginUser(credentials));

        if (loginUser.fulfilled.match(result)) {
            dispatch(fetchMyProfile());
        }
    };

    if (isAuthenticated && user) {
        return (
            <Box sx={{ p: 4 }}>
                <Alert severity="success">
                    Logged in successfully as {user.name}
                </Alert>

                <Typography sx={{ mt: 2 }}>
                    Role: {user.role?.name}
                </Typography>

                <Typography>
                    Permissions: {permissions.join(', ')}
                </Typography>
            </Box>
        );
    }

    return (
        <Box
            sx={{
                minHeight: '100vh',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                backgroundColor: '#f4f6f8',
                px: 2,
            }}
        >
            <Paper
                elevation={4}
                sx={{
                    width: '100%',
                    maxWidth: 420,
                    p: 4,
                    borderRadius: 3,
                }}
            >
                <Typography variant="h4" fontWeight={700} gutterBottom>
                    Sign in
                </Typography>

                <Typography color="text.secondary" sx={{ mb: 3 }}>
                    Sign in to access the RBAC application
                </Typography>

                {error && (
                    <Alert severity="error" sx={{ mb: 2 }}>
                        {error}
                    </Alert>
                )}

                <Box
                    component="form"
                    onSubmit={handleSubmit(onSubmit)}
                    noValidate
                >
                    <TextField
                        label="Email"
                        type="email"
                        fullWidth
                        margin="normal"
                        autoComplete="email"
                        error={Boolean(errors.email)}
                        helperText={errors.email?.message}
                        {...register('email')}
                    />

                    <TextField
                        label="Password"
                        type="password"
                        fullWidth
                        margin="normal"
                        autoComplete="current-password"
                        error={Boolean(errors.password)}
                        helperText={errors.password?.message}
                        {...register('password')}
                    />

                    <Button
                        type="submit"
                        variant="contained"
                        fullWidth
                        size="large"
                        disabled={isLoading}
                        sx={{ mt: 3 }}
                    >
                        {isLoading ? (
                            <CircularProgress size={24} color="inherit" />
                        ) : (
                            'Sign in'
                        )}
                    </Button>
                </Box>
            </Paper>
        </Box>
    );
};

export default LoginPage;