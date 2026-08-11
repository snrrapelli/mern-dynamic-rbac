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
    fetchUsers,
    clearUserError,
    createUser,
    updateUser,
    deleteUser,
} from '../features/users/userSlice';
import {
    clearRoleError,
    fetchRoles,
    clearRoleOptionsError,
    fetchRoleOptions,
} from '../features/roles/roleSlice';
import UserFormDialog from '../features/users/UserFormDialog';

const UsersPage = () => {
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [successMessage, setSuccessMessage] = useState('');
    const [selectedUser, setSelectedUser] = useState(null);
    const [userToDelete, setUserToDelete] = useState(null);
    const dispatch = useDispatch();

    const {
        items,
        isLoading,
        isSubmitting,
        isDeleting,
        error
    } = useSelector(
        (state) => state.users
    );
    const {
        items: roles,
        isLoading: isLoadingRoles,
        error: roleError,
        roleOptions,
        isLoadingOptions,
        optionsError,
    } = useSelector((state) => state.roles);

    useEffect(() => {
        dispatch(fetchUsers());
    }, [dispatch]);

    const formatDate = (date) => {
        if (!date) return '-';

        return new Intl.DateTimeFormat('en-IN', {
            day: '2-digit',
            month: 'short',
            year: 'numeric',
        }).format(new Date(date));
    };

    const handleOpenCreateDialog = () => {
        dispatch(clearUserError());
        dispatch(clearRoleOptionsError());
        setSelectedUser(null);
        setIsDialogOpen(true);
        dispatch(fetchRoleOptions());
    };

    const handleOpenEditDialog = (user) => {
        dispatch(clearUserError());
        dispatch(clearRoleOptionsError());
        setSelectedUser(user);
        setIsDialogOpen(true);
        dispatch(fetchRoleOptions());
    };

    const handleCloseDialog = () => {
        setIsDialogOpen(false);
        setSelectedUser(null);
        dispatch(clearUserError());
        dispatch(clearRoleOptionsError());
    };

    const handleCreateUser = async (userData) => {
        const result = await dispatch(createUser(userData));

        if (createUser.fulfilled.match(result)) {
            setIsDialogOpen(false);
            setSuccessMessage(result.payload.message);
        }
    };

    const handleUpdateUser = async (userData) => {
        if (!selectedUser) return;

        const result = await dispatch(
            updateUser({
                userId: selectedUser._id,
                userData,
            })
        );

        if (updateUser.fulfilled.match(result)) {
            setIsDialogOpen(false);
            setSelectedUser(null);
            setSuccessMessage(result.payload.message);
        }
    };

    const handleSubmitUser = (userData) => {
        if (selectedUser) {
            return handleUpdateUser(userData);
        }

        return handleCreateUser(userData);
    };

    const handleOpenDeleteDialog = (user) => {
        dispatch(clearUserError());
        setUserToDelete(user);
    };

    const handleCloseDeleteDialog = () => {
        if (!isDeleting) {
            setUserToDelete(null);
            dispatch(clearUserError());
        }
    };

    const handleDeleteUser = async () => {
        if (!userToDelete) return;

        const result = await dispatch(deleteUser(userToDelete._id));

        if (deleteUser.fulfilled.match(result)) {
            setUserToDelete(null);
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
                        Users
                    </Typography>

                    <Typography color="text.secondary">
                        Manage users and their assigned roles
                    </Typography>
                </Box>

                <Can permission="users:create">
                    <Button
                        variant="contained"
                        startIcon={<AddIcon />}
                        onClick={handleOpenCreateDialog}
                    >
                        Add User
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
                            onClick={() => dispatch(fetchUsers())}
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
                            <TableCell>Email</TableCell>
                            <TableCell>Role</TableCell>
                            <TableCell>Status</TableCell>
                            <TableCell>Created On</TableCell>
                            <TableCell align="right">
                                Actions
                            </TableCell>
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
                                    No users found
                                </TableCell>
                            </TableRow>
                        ) : (
                            items.map((user) => (
                                <TableRow key={user._id} hover>
                                    <TableCell>{user.name}</TableCell>

                                    <TableCell>{user.email}</TableCell>

                                    <TableCell>
                                        {user.role?.name || '-'}
                                    </TableCell>

                                    <TableCell>
                                        <Chip
                                            label={
                                                user.isActive
                                                    ? 'Active'
                                                    : 'Inactive'
                                            }
                                            color={
                                                user.isActive
                                                    ? 'success'
                                                    : 'default'
                                            }
                                            size="small"
                                        />
                                    </TableCell>

                                    <TableCell>
                                        {formatDate(user.createdAt)}
                                    </TableCell>

                                    <TableCell align="right">
                                        <Can permission="users:update">
                                            <Button
                                                size="small"
                                                startIcon={<EditIcon />}
                                                onClick={() => handleOpenEditDialog(user)}
                                            >
                                                Edit
                                            </Button>
                                        </Can>

                                        <Can permission="users:delete">
                                            <Button
                                                size="small"
                                                color="error"
                                                startIcon={<DeleteIcon />}
                                                onClick={() => handleOpenDeleteDialog(user)}
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
            <UserFormDialog
                open={isDialogOpen}
                onClose={handleCloseDialog}
                onSubmit={handleSubmitUser}
                roles={roleOptions}
                isLoadingRoles={isLoadingRoles}
                isSubmitting={isSubmitting}
                error={error}
                roleError={optionsError}
                user={selectedUser}
            />

            <Dialog
                open={Boolean(userToDelete)}
                onClose={handleCloseDeleteDialog}
                fullWidth
                maxWidth="xs"
            >
                <DialogTitle>Delete User?</DialogTitle>

                <DialogContent>
                    <DialogContentText>
                        Are you sure you want to delete{' '}
                        <strong>{userToDelete?.name}</strong>? This action
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
                        onClick={handleDeleteUser}
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

export default UsersPage;