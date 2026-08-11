import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
    Alert,
    Box,
    Button,
    Chip,
    CircularProgress,
    Paper,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Typography,
    Snackbar,
    Dialog,
    DialogActions,
    DialogContent,
    DialogContentText,
    DialogTitle,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import RefreshIcon from '@mui/icons-material/Refresh';
import Can from '../components/Can';
import {
    fetchPermissions,
    clearPermissionError,
    createPermission,
    updatePermission,
    deletePermission
} from '../features/permissions/permissionSlice';
import PermissionFormDialog from '../features/permissions/PermissionFormDialog';


const PermissionsPage = () => {
    const dispatch = useDispatch();
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [successMessage, setSuccessMessage] = useState('');
    const [selectedPermission, setSelectedPermission] = useState(null);
    const [permissionToDelete, setPermissionToDelete] = useState(null);

    const { items, isLoading, isSubmitting, isDeleting, error } = useSelector(
        (state) => state.permissions
    );

    useEffect(() => {
        dispatch(fetchPermissions());
    }, [dispatch]);

    const handleOpenCreateDialog = () => {
        dispatch(clearPermissionError());
        setSelectedPermission(null);
        setIsDialogOpen(true);
    };

    const handleOpenEditDialog = (permission) => {
        dispatch(clearPermissionError());
        setSelectedPermission(permission);
        setIsDialogOpen(true);
    };

    const handleCloseDialog = () => {
        setIsDialogOpen(false);
        setSelectedPermission(null);
        dispatch(clearPermissionError());
    };

    const handleCreatePermission = async (permissionData) => {
        const result = await dispatch(
            createPermission(permissionData)
        );

        if (createPermission.fulfilled.match(result)) {
            setIsDialogOpen(false);
            setSuccessMessage(result.payload.message);
            dispatch(fetchPermissions());
        }
    };

    const handleUpdatePermission = async (permissionData) => {
        const result = await dispatch(
            updatePermission({
                permissionId: selectedPermission._id,
                permissionData,
            })
        );

        if (updatePermission.fulfilled.match(result)) {
            setIsDialogOpen(false);
            setSelectedPermission(null);
            setSuccessMessage(result.payload.message);
        }
    };

    const handleSubmitPermission = (permissionData) => {
        if (selectedPermission) {
            return handleUpdatePermission(permissionData);
        }

        return handleCreatePermission(permissionData);
    };

    const handleOpenDeleteDialog = (permission) => {
        dispatch(clearPermissionError());
        setPermissionToDelete(permission);
    };

    const handleCloseDeleteDialog = () => {
        if (!isDeleting) {
            setPermissionToDelete(null);
            dispatch(clearPermissionError());
        }
    };

    const handleDeletePermission = async () => {
        if (!permissionToDelete) return;

        const result = await dispatch(
            deletePermission(permissionToDelete._id)
        );

        if (deletePermission.fulfilled.match(result)) {
            setPermissionToDelete(null);
            setSuccessMessage(result.payload.message);
        }
    };

    return (
        <Box>
            <Box
                sx={{
                    mb: 3,
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    gap: 2,
                }}
            >
                <Box>
                    <Typography variant="h4" fontWeight={700}>
                        Permissions
                    </Typography>

                    <Typography color="text.secondary">
                        Manage application resources and allowed actions
                    </Typography>
                </Box>

                <Can permission="permissions:create">
                    <Button
                        variant="contained"
                        startIcon={<AddIcon />}
                        onClick={handleOpenCreateDialog}
                    >
                        Add Permission
                    </Button>
                </Can>
            </Box>

            {error && (
                <Alert
                    severity="error"
                    action={
                        <Button
                            color="inherit"
                            size="small"
                            startIcon={<RefreshIcon />}
                            onClick={() => dispatch(fetchPermissions())}
                        >
                            Retry
                        </Button>
                    }
                    sx={{ mb: 2 }}
                >
                    {error}
                </Alert>
            )}

            <TableContainer component={Paper}>
                <Table>
                    <TableHead>
                        <TableRow>
                            <TableCell>Name</TableCell>
                            <TableCell>Resource</TableCell>
                            <TableCell>Action</TableCell>
                            <TableCell>Description</TableCell>
                            <TableCell>Status</TableCell>
                            <TableCell align="right">Actions</TableCell>
                        </TableRow>
                    </TableHead>

                    <TableBody>
                        {isLoading ? (
                            <TableRow>
                                <TableCell colSpan={6} align="center">
                                    <CircularProgress size={32} />
                                </TableCell>
                            </TableRow>
                        ) : items.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={6} align="center">
                                    No permissions found
                                </TableCell>
                            </TableRow>
                        ) : (
                            items.map((permission) => (
                                <TableRow key={permission._id} hover>
                                    <TableCell>
                                        {permission.name}
                                    </TableCell>

                                    <TableCell>
                                        {permission.resource}
                                    </TableCell>

                                    <TableCell>
                                        {permission.action}
                                    </TableCell>

                                    <TableCell>
                                        {permission.description || '-'}
                                    </TableCell>

                                    <TableCell>
                                        <Chip
                                            label={
                                                permission.isActive
                                                    ? 'Active'
                                                    : 'Inactive'
                                            }
                                            color={
                                                permission.isActive
                                                    ? 'success'
                                                    : 'default'
                                            }
                                            size="small"
                                        />
                                    </TableCell>

                                    <TableCell align="right">
                                        <Can permission="permissions:update">
                                            <Button
                                                size="small"
                                                startIcon={<EditIcon />}
                                                onClick={() => handleOpenEditDialog(permission)}
                                            >
                                                Edit
                                            </Button>
                                        </Can>

                                        <Can permission="permissions:delete">
                                            <Button
                                                size="small"
                                                color="error"
                                                startIcon={<DeleteIcon />}
                                                onClick={() => handleOpenDeleteDialog(permission)}
                                            >
                                                Delete
                                            </Button>
                                        </Can>
                                    </TableCell>
                                </TableRow>
                            ))
                        )}
                    </TableBody>
                </Table>
            </TableContainer>
            <PermissionFormDialog
                open={isDialogOpen}
                onClose={handleCloseDialog}
                onSubmit={handleSubmitPermission}
                isSubmitting={isSubmitting}
                permission={selectedPermission}
            />
            <Dialog
                open={Boolean(permissionToDelete)}
                onClose={handleCloseDeleteDialog}
                fullWidth
                maxWidth="xs"
            >
                <DialogTitle>Delete Permission?</DialogTitle>

                <DialogContent>
                    <DialogContentText>
                        Are you sure you want to delete{' '}
                        <strong>{permissionToDelete?.name}</strong>?
                        This action cannot be undone.
                    </DialogContentText>
                </DialogContent>

                <DialogActions sx={{ px: 3, pb: 3 }}>
                    <Button
                        onClick={handleCloseDeleteDialog}
                        disabled={isDeleting}
                    >
                        Cancel
                    </Button>
                    <Button
                        variant="contained"
                        color="error"
                        onClick={handleDeletePermission}
                        disabled={isDeleting}
                    >
                        {isDeleting ? (
                            <CircularProgress size={22} color="inherit" />
                        ) : (
                            'Delete'
                        )}
                    </Button>
                </DialogActions>
            </Dialog>
            <Snackbar
                open={Boolean(successMessage)}
                autoHideDuration={3000}
                onClose={() => setSuccessMessage('')}
                message={successMessage}
            />
        </Box>
    );
};

export default PermissionsPage;