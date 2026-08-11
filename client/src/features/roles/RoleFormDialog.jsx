import { useEffect, useMemo } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import {
    Alert,
    Box,
    Button,
    Checkbox,
    CircularProgress,
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
    Divider,
    FormControlLabel,
    FormGroup,
    Paper,
    TextField,
    Typography,
    Switch,
} from '@mui/material';

const schema = yup.object({
    name: yup
        .string()
        .trim()
        .lowercase()
        .required('Role name is required')
        .matches(
            /^[a-z][a-z0-9_-]*$/,
            'Use lowercase letters, numbers, hyphens, or underscores'
        ),
    description: yup
        .string()
        .trim()
        .max(250, 'Description cannot exceed 250 characters'),
    permissions: yup.array().of(yup.string()),
    isActive: yup.boolean(),
});

const RoleFormDialog = ({
    open,
    onClose,
    onSubmit,
    permissions,
    isLoadingPermissions,
    isSubmitting,
    error,
    permissionError,
    role = null,
}) => {
    const {
        register,
        control,
        handleSubmit,
        reset,
        watch,
        setValue,
        formState: { errors },
    } = useForm({
        resolver: yupResolver(schema),
        defaultValues: {
            name: '',
            description: '',
            permissions: [],
            isActive: true,
        },
    });

    const isEditMode = Boolean(role);

    const selectedPermissions = watch('permissions') || [];

    const groupedPermissions = useMemo(() => {
        return permissions
            .filter((permission) => permission.isActive)
            .reduce((groups, permission) => {
                if (!groups[permission.resource]) {
                    groups[permission.resource] = [];
                }

                groups[permission.resource].push(permission);
                return groups;
            }, {});
    }, [permissions]);

    useEffect(() => {
        if (!open) return;

        const activePermissionIds = new Set(
            permissions
                .filter((permission) => permission.isActive)
                .map((permission) => permission._id)
        );

        const assignedPermissionIds =
            role?.permissions
                ?.map((permission) =>
                    typeof permission === 'string'
                        ? permission
                        : permission._id
                )
                .filter((permissionId) =>
                    activePermissionIds.has(permissionId)
                ) || [];

        reset({
            name: role?.name || '',
            description: role?.description || '',
            permissions: assignedPermissionIds,
            isActive: role?.isActive ?? true,
        });
    }, [open, role, permissions, reset]);

    const handlePermissionChange = (permissionId) => {
        const isSelected = selectedPermissions.includes(permissionId);

        const updatedPermissions = isSelected
            ? selectedPermissions.filter((id) => id !== permissionId)
            : [...selectedPermissions, permissionId];

        setValue('permissions', updatedPermissions, {
            shouldDirty: true,
        });
    };

    const handleResourceChange = (resourcePermissions) => {
        const resourceIds = resourcePermissions.map(
            (permission) => permission._id
        );

        const allSelected = resourceIds.every((id) =>
            selectedPermissions.includes(id)
        );

        const updatedPermissions = allSelected
            ? selectedPermissions.filter(
                (id) => !resourceIds.includes(id)
            )
            : [
                ...new Set([
                    ...selectedPermissions,
                    ...resourceIds,
                ]),
            ];

        setValue('permissions', updatedPermissions, {
            shouldDirty: true,
        });
    };

    const handleFormSubmit = (values) => {
        onSubmit({
            name: values.name.trim().toLowerCase(),
            description: values.description?.trim() || '',
            permissions: values.permissions,
            isActive: values.isActive,
        });
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
            maxWidth="md"
        >
            <DialogTitle>{isEditMode ? 'Edit Role' : 'Add Role'}</DialogTitle>

            <DialogContent>
                {error && (
                    <Alert severity="error" sx={{ mt: 1, mb: 2 }}>
                        {error}
                    </Alert>
                )}

                {permissionError && (
                    <Alert severity="error" sx={{ mt: 1, mb: 2 }}>
                        {permissionError}
                    </Alert>
                )}

                <TextField
                    label="Role Name"
                    placeholder="Example: report-manager"
                    fullWidth
                    margin="normal"
                    autoFocus
                    error={Boolean(errors.name)}
                    helperText={errors.name?.message}
                    {...register('name')}
                />

                <TextField
                    label="Description"
                    multiline
                    rows={2}
                    fullWidth
                    margin="normal"
                    error={Boolean(errors.description)}
                    helperText={errors.description?.message}
                    {...register('description')}
                />

                {isEditMode && (
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
                )}

                <Typography
                    variant="h6"
                    fontWeight={600}
                    sx={{ mt: 3, mb: 0.5 }}
                >
                    Permissions
                </Typography>

                <Typography
                    variant="body2"
                    color="text.secondary"
                    sx={{ mb: 2 }}
                >
                    Select the actions this role can perform
                </Typography>

                {isLoadingPermissions ? (
                    <Box
                        sx={{
                            display: 'flex',
                            justifyContent: 'center',
                            py: 4,
                        }}
                    >
                        <CircularProgress size={32} />
                    </Box>
                ) : Object.keys(groupedPermissions).length === 0 ? (
                    <Alert severity="info">
                        No active permissions are available
                    </Alert>
                ) : (
                    <Box
                        sx={{
                            display: 'grid',
                            gridTemplateColumns: {
                                xs: '1fr',
                                md: 'repeat(2, 1fr)',
                            },
                            gap: 2,
                        }}
                    >
                        {Object.entries(groupedPermissions).map(
                            ([resource, resourcePermissions]) => {
                                const resourceIds =
                                    resourcePermissions.map(
                                        (permission) => permission._id
                                    );

                                const selectedCount =
                                    resourceIds.filter((id) =>
                                        selectedPermissions.includes(id)
                                    ).length;

                                const allSelected =
                                    selectedCount === resourceIds.length;

                                const partiallySelected =
                                    selectedCount > 0 && !allSelected;

                                return (
                                    <Paper
                                        key={resource}
                                        variant="outlined"
                                        sx={{ p: 2 }}
                                    >
                                        <FormControlLabel
                                            control={
                                                <Checkbox
                                                    checked={allSelected}
                                                    indeterminate={
                                                        partiallySelected
                                                    }
                                                    onChange={() =>
                                                        handleResourceChange(
                                                            resourcePermissions
                                                        )
                                                    }
                                                />
                                            }
                                            label={
                                                <Typography
                                                    fontWeight={700}
                                                    sx={{
                                                        textTransform:
                                                            'capitalize',
                                                    }}
                                                >
                                                    {resource}
                                                </Typography>
                                            }
                                        />

                                        <Divider sx={{ my: 1 }} />

                                        <FormGroup>
                                            {resourcePermissions.map(
                                                (permission) => (
                                                    <FormControlLabel
                                                        key={permission._id}
                                                        control={
                                                            <Checkbox
                                                                checked={selectedPermissions.includes(
                                                                    permission._id
                                                                )}
                                                                onChange={() =>
                                                                    handlePermissionChange(
                                                                        permission._id
                                                                    )
                                                                }
                                                            />
                                                        }
                                                        label={
                                                            permission.action
                                                        }
                                                    />
                                                )
                                            )}
                                        </FormGroup>
                                    </Paper>
                                );
                            }
                        )}
                    </Box>
                )}

                <Typography
                    variant="body2"
                    color="text.secondary"
                    sx={{ mt: 2 }}
                >
                    {selectedPermissions.length} permission(s) selected
                </Typography>
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
                        isLoadingPermissions ||
                        Boolean(permissionError)
                    }
                >
                    {isSubmitting ? (
                        <CircularProgress size={22} color="inherit" />
                    ) : isEditMode ? (
                        'Save Changes'
                    ) : (
                        'Create Role'
                    )}
                </Button>
            </DialogActions>
        </Dialog>
    );
};

export default RoleFormDialog;