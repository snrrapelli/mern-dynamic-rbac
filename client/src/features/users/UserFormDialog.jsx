import { useEffect } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import {
    Alert,
    Button,
    CircularProgress,
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
    FormControl,
    FormControlLabel,
    FormHelperText,
    InputLabel,
    MenuItem,
    Select,
    Switch,
    TextField,
} from '@mui/material';

const getUserSchema = (isEditMode) =>
    yup.object({
        name: yup
            .string()
            .trim()
            .required('Name is required'),
        email: yup
            .string()
            .trim()
            .email('Enter a valid email address')
            .required('Email is required'),
        password: isEditMode
            ? yup
                .string()
                .test(
                    'password-length',
                    'Password must contain at least 8 characters',
                    (value) => !value || value.length >= 8
                )
            : yup
                .string()
                .min(
                    8,
                    'Password must contain at least 8 characters'
                )
                .required('Password is required'),
        role: yup
            .string()
            .required('Role is required'),
        isActive: yup.boolean(),
    });

const UserFormDialog = ({
    open,
    onClose,
    onSubmit,
    roles,
    isLoadingRoles,
    isSubmitting,
    error,
    roleError,
    user = null,
}) => {
    const isEditMode = Boolean(user);
    const {
        register,
        control,
        handleSubmit,
        reset,
        formState: { errors },
    } = useForm({
        resolver: yupResolver(getUserSchema(isEditMode)),
        defaultValues: {
            name: '',
            email: '',
            password: '',
            role: '',
            isActive: true,
        },
    });

    useEffect(() => {
        if (!open) return;

        reset({
            name: user?.name || '',
            email: user?.email || '',
            password: '',
            role:
                typeof user?.role === 'string'
                    ? user.role
                    : user?.role?._id || '',
            isActive: user?.isActive ?? true,
        });
    }, [open, user, reset]);


    const activeRoles = roles.filter((role) => role.isActive);

    const handleFormSubmit = (values) => {
        const userData = {
            name: values.name.trim(),
            email: values.email.trim().toLowerCase(),
            role: values.role,
            isActive: values.isActive,
        };

        if (values.password) {
            userData.password = values.password;
        }

        onSubmit(userData);
    };

    const handleClose = () => {
        if (!isSubmitting) {
            onClose();
        }
    };

    return (
        <Dialog
            open={open}
            onClose={handleClose}
            fullWidth
            maxWidth="sm"
        >
            <DialogTitle>{isEditMode ? 'Edit User' : 'Add User'}</DialogTitle>

            <DialogContent>
                {error && (
                    <Alert severity="error" sx={{ mt: 1, mb: 2 }}>
                        {error}
                    </Alert>
                )}

                {roleError && (
                    <Alert severity="error" sx={{ mt: 1, mb: 2 }}>
                        {roleError}
                    </Alert>
                )}

                <TextField
                    label="Name"
                    fullWidth
                    margin="normal"
                    autoFocus
                    error={Boolean(errors.name)}
                    helperText={errors.name?.message}
                    {...register('name')}
                />

                <TextField
                    label="Email"
                    type="email"
                    fullWidth
                    margin="normal"
                    error={Boolean(errors.email)}
                    helperText={errors.email?.message}
                    {...register('email')}
                />

                <TextField
                    label={isEditMode ? 'New Password' : 'Password'}
                    type="password"
                    fullWidth
                    margin="normal"
                    error={Boolean(errors.password)}
                    helperText={
                        errors.password?.message ||
                        (isEditMode
                            ? 'Leave blank to keep the current password'
                            : '')
                    }
                    {...register('password')}
                />

                <Controller
                    name="role"
                    control={control}
                    render={({ field }) => (
                        <FormControl
                            fullWidth
                            margin="normal"
                            error={Boolean(errors.role)}
                        >
                            <InputLabel>Role</InputLabel>

                            <Select
                                {...field}
                                label="Role"
                                disabled={isLoadingRoles}
                            >
                                {activeRoles.map((role) => (
                                    <MenuItem
                                        key={role._id}
                                        value={role._id}
                                    >
                                        {role.name}
                                    </MenuItem>
                                ))}
                            </Select>

                            <FormHelperText>
                                {errors.role?.message}
                            </FormHelperText>
                        </FormControl>
                    )}
                />

                <Controller
                    name="isActive"
                    control={control}
                    render={({ field }) => (
                        <FormControlLabel
                            control={
                                <Switch
                                    checked={field.value}
                                    onChange={(_, checked) =>
                                        field.onChange(checked)
                                    }
                                />
                            }
                            label="Active"
                            sx={{ mt: 1 }}
                        />
                    )}
                />
            </DialogContent>

            <DialogActions sx={{ px: 3, pb: 3 }}>
                <Button
                    onClick={handleClose}
                    disabled={isSubmitting}
                >
                    Cancel
                </Button>

                <Button
                    variant="contained"
                    onClick={handleSubmit(handleFormSubmit)}
                    disabled={
                        isSubmitting ||
                        isLoadingRoles ||
                        Boolean(roleError) ||
                        activeRoles.length === 0
                    }
                >
                    {isSubmitting ? (
                        <CircularProgress size={22} color="inherit" />
                    ) : isEditMode ? (
                        'Save Changes'
                    ) : (
                        'Create User'
                    )}
                </Button>
            </DialogActions>
        </Dialog>
    );
};

export default UserFormDialog;