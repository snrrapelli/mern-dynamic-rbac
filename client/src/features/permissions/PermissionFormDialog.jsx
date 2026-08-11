import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import {
    Button,
    CircularProgress,
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
    FormControlLabel,
    MenuItem,
    Switch,
    TextField,
} from '@mui/material';

const schema = yup.object({
    resource: yup
        .string()
        .trim()
        .lowercase()
        .required('Resource is required')
        .matches(
            /^[a-z][a-z0-9_-]*$/,
            'Use lowercase letters, numbers, hyphens, or underscores'
        ),
    action: yup
        .string()
        .required('Action is required')
        .oneOf(
            ['create', 'read', 'update', 'delete'],
            'Invalid action'
        ),
    description: yup
        .string()
        .trim()
        .max(250, 'Description cannot exceed 250 characters'),
    isActive: yup.boolean(),
});

const PermissionFormDialog = ({
    open,
    onClose,
    onSubmit,
    isSubmitting,
    permission = null,
}) => {
    const isEditMode = Boolean(permission);

    const {
        register,
        handleSubmit,
        reset,
        watch,
        formState: { errors },
    } = useForm({
        resolver: yupResolver(schema),
        defaultValues: {
            resource: '',
            action: '',
            description: '',
            isActive: true,
        },
    });

    const resource = watch('resource');
    const action = watch('action');

    useEffect(() => {
        if (open) {
            reset({
                resource: permission?.resource || '',
                action: permission?.action || '',
                description: permission?.description || '',
                isActive: permission?.isActive ?? true,
            });
        }
    }, [open, permission, reset]);

    const handleFormSubmit = (values) => {
        const normalizedResource = values.resource
            .trim()
            .toLowerCase();

        onSubmit({
            name: `${normalizedResource}:${values.action}`,
            resource: normalizedResource,
            action: values.action,
            description: values.description?.trim() || '',
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
            maxWidth="sm"
        >
            <DialogTitle>
                {isEditMode ? 'Edit Permission' : 'Add Permission'}
            </DialogTitle>

            <DialogContent>
                <TextField
                    label="Resource"
                    placeholder="Example: reports"
                    fullWidth
                    margin="normal"
                    autoFocus
                    error={Boolean(errors.resource)}
                    helperText={errors.resource?.message}
                    {...register('resource')}
                />

                <TextField
                    label="Action"
                    select
                    fullWidth
                    margin="normal"
                    value={action || ''}
                    error={Boolean(errors.action)}
                    helperText={errors.action?.message}
                    {...register('action')}
                >
                    <MenuItem value="create">Create</MenuItem>
                    <MenuItem value="read">Read</MenuItem>
                    <MenuItem value="update">Update</MenuItem>
                    <MenuItem value="delete">Delete</MenuItem>
                </TextField>

                <TextField
                    label="Permission Name"
                    value={
                        resource && action
                            ? `${resource.trim().toLowerCase()}:${action}`
                            : ''
                    }
                    placeholder="Generated automatically"
                    fullWidth
                    margin="normal"
                    disabled
                />

                <TextField
                    label="Description"
                    multiline
                    rows={3}
                    fullWidth
                    margin="normal"
                    error={Boolean(errors.description)}
                    helperText={errors.description?.message}
                    {...register('description')}
                />

                {isEditMode && (
                    <FormControlLabel
                        control={
                            <Switch
                                {...register('isActive')}
                                defaultChecked={
                                    permission?.isActive ?? true
                                }
                            />
                        }
                        label="Active"
                    />
                )}
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
                    disabled={isSubmitting}
                >
                    {isSubmitting ? (
                        <CircularProgress size={22} color="inherit" />
                    ) : isEditMode ? (
                        'Save Changes'
                    ) : (
                        'Create'
                    )}
                </Button>
            </DialogActions>
        </Dialog>
    );
};

export default PermissionFormDialog;