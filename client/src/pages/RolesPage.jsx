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
    clearRoleError,
    createRole,
    fetchRoles,
    updateRole,
    deleteRole
} from '../features/roles/roleSlice';
import RoleFormDialog from '../features/roles/RoleFormDialog';
import {
    clearPermissionError,
    fetchPermissions,
} from '../features/permissions/permissionSlice';

const RolesPage = () => {
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [successMessage, setSuccessMessage] = useState('');
    const [selectedRole, setSelectedRole] = useState(null);
    const [roleToDelete, setRoleToDelete] = useState(null);
    const dispatch = useDispatch();

    const { items, isLoading, isSubmitting, isDeleting, error } = useSelector(
        (state) => state.roles
    );

    const {
        items: permissions,
        isLoading: isLoadingPermissions,
        error: permissionError,
    } = useSelector((state) => state.permissions);

    useEffect(() => {
        dispatch(fetchRoles());
    }, [dispatch]);

    const handleOpenCreateDialog = () => {
        dispatch(clearRoleError());
        dispatch(clearPermissionError());
        setSelectedRole(null);
        setIsDialogOpen(true);
        dispatch(fetchPermissions());
    };

    const handleOpenEditDialog = (role) => {
        dispatch(clearRoleError());
        dispatch(clearPermissionError());
        setSelectedRole(role);
        setIsDialogOpen(true);
        dispatch(fetchPermissions());
    };

    const handleCloseDialog = () => {
        setIsDialogOpen(false);
        setSelectedRole(null);
        dispatch(clearRoleError());
        dispatch(clearPermissionError());
    };

    const handleCreateRole = async (roleData) => {
        const result = await dispatch(createRole(roleData));

        if (createRole.fulfilled.match(result)) {
            setIsDialogOpen(false);
            setSuccessMessage(result.payload.message);
        }
    };

    const handleUpdateRole = async (roleData) => {
        if (!selectedRole) return;

        const result = await dispatch(
            updateRole({
                roleId: selectedRole._id,
                roleData,
            })
        );

        if (updateRole.fulfilled.match(result)) {
            setIsDialogOpen(false);
            setSelectedRole(null);
            setSuccessMessage(result.payload.message);
        }
    };

    const handleSubmitRole = (roleData) => {
        if (selectedRole) {
            return handleUpdateRole(roleData);
        }

        return handleCreateRole(roleData);
    };

    const handleOpenDeleteDialog = (role) => {
        dispatch(clearRoleError());
        setRoleToDelete(role);
    };

    const handleCloseDeleteDialog = () => {
        if (!isDeleting) {
            setRoleToDelete(null);
            dispatch(clearRoleError());
        }
    };

    const handleDeleteRole = async () => {
        if (!roleToDelete) return;

        const result = await dispatch(deleteRole(roleToDelete._id));

        if (deleteRole.fulfilled.match(result)) {
            setRoleToDelete(null);
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
                        Roles
                    </Typography>

                    <Typography color="text.secondary">
                        Manage roles and their assigned permissions
                    </Typography>
                </Box>

                <Can permission="roles:create">
                    <Button
                        variant="contained"
                        startIcon={<AddIcon />}
                        onClick={handleOpenCreateDialog}
                    >
                        Add Role
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
                            onClick={() => dispatch(fetchRoles())}
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
                            <TableCell>Description</TableCell>
                            <TableCell>Permissions</TableCell>
                            <TableCell>Status</TableCell>
                            <TableCell align="right">
                                Actions
                            </TableCell>
                        </TableRow>
                    </TableHead>

                    <TableBody>
                        {isLoading ? (
                            <TableRow>
                                <TableCell colSpan={5} align="center">
                                    <CircularProgress size={32} />
                                </TableCell>
                            </TableRow>
                        ) : items.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={5} align="center">
                                    No roles found
                                </TableCell>
                            </TableRow>
                        ) : (
                            items.map((role) => (
                                <TableRow key={role._id} hover>
                                    <TableCell>{role.name}</TableCell>

                                    <TableCell>
                                        {role.description || '-'}
                                    </TableCell>

                                    <TableCell>
                                        <Chip
                                            label={`${role.permissions?.length || 0} permissions`}
                                            size="small"
                                            variant="outlined"
                                        />
                                    </TableCell>

                                    <TableCell>
                                        <Chip
                                            label={
                                                role.isActive
                                                    ? 'Active'
                                                    : 'Inactive'
                                            }
                                            color={
                                                role.isActive
                                                    ? 'success'
                                                    : 'default'
                                            }
                                            size="small"
                                        />
                                    </TableCell>

                                    <TableCell align="right">
                                        <Can permission="roles:update">
                                            <Button
                                                size="small"
                                                startIcon={<EditIcon />}
                                                onClick={() => handleOpenEditDialog(role)}
                                            >
                                                Edit
                                            </Button>
                                        </Can>

                                        <Can permission="roles:delete">
                                            <Button
                                                size="small"
                                                color="error"
                                                startIcon={<DeleteIcon />}
                                                onClick={() => handleOpenDeleteDialog(role)}
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

            <RoleFormDialog
                open={isDialogOpen}
                onClose={handleCloseDialog}
                onSubmit={handleSubmitRole}
                permissions={permissions}
                isLoadingPermissions={isLoadingPermissions}
                isSubmitting={isSubmitting}
                error={error}
                permissionError={permissionError}
                role={selectedRole}
            />

            <Dialog
                open={Boolean(roleToDelete)}
                onClose={handleCloseDeleteDialog}
                fullWidth
                maxWidth="xs"
            >
                <DialogTitle>Delete Role?</DialogTitle>

                <DialogContent>
                    <DialogContentText>
                        Are you sure you want to delete{' '}
                        <strong>{roleToDelete?.name}</strong>? This action
                        cannot be undone.
                    </DialogContentText>

                    {error && (
                        <Alert severity="error" sx={{ mt: 2 }}>
                            {error}
                        </Alert>
                    )}
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
                        onClick={handleDeleteRole}
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

export default RolesPage;