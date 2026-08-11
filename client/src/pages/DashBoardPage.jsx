import { useSelector } from 'react-redux';
import {
    Box,
    Button,
    Paper,
    Typography,
    Stack,
} from '@mui/material';
import Can from '../components/Can';

const DashboardPage = () => {

    const { user, permissions } = useSelector((state) => state.auth);

    return (
        <Box sx={{ p: 4 }}>
            <Paper sx={{ p: 4 }}>
                <Typography variant="h4" fontWeight={700}>
                    RBAC Dashboard
                </Typography>

                <Typography sx={{ mt: 2 }}>
                    Welcome, {user?.name}
                </Typography>

                <Typography>
                    Role: {user?.role?.name}
                </Typography>

                <Typography sx={{ mt: 2 }}>
                    Permissions:
                </Typography>

                <Typography color="text.secondary">
                    {permissions.length
                        ? permissions.join(', ')
                        : 'No permissions assigned'}
                </Typography>

                <Stack
                    direction="row"
                    spacing={2}
                    flexWrap="wrap"
                    useFlexGap
                    sx={{ mt: 3 }}
                >
                    <Can permission="permissions:read">
                        <Button variant="contained">
                            View Permissions
                        </Button>
                    </Can>

                    <Can permission="permissions:create">
                        <Button variant="contained">
                            Create Permission
                        </Button>
                    </Can>

                    <Can permission="roles:read">
                        <Button variant="contained">
                            View Roles
                        </Button>
                    </Can>

                    <Can permission="users:read">
                        <Button variant="contained">
                            View Users
                        </Button>
                    </Can>
                </Stack>
            </Paper>
        </Box>
    );
};

export default DashboardPage;