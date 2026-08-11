import { NavLink, Outlet } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import {
    AppBar,
    Box,
    Button,
    Divider,
    Drawer,
    List,
    ListItemButton,
    ListItemIcon,
    ListItemText,
    Toolbar,
    Typography,
} from '@mui/material';
import {
    Dashboard as DashboardIcon,
    Lock as PermissionIcon,
    ManageAccounts as RoleIcon,
    People as UserIcon,
} from '@mui/icons-material';
import { logout } from '../features/auth/authSlice';

const drawerWidth = 240;

const menuItems = [
    {
        label: 'Dashboard',
        path: '/dashboard',
        icon: <DashboardIcon />,
        permission: null,
    },
    {
        label: 'Permissions',
        path: '/permissions',
        icon: <PermissionIcon />,
        permission: 'permissions:read',
    },
    {
        label: 'Roles',
        path: '/roles',
        icon: <RoleIcon />,
        permission: 'roles:read',
    },
    {
        label: 'Users',
        path: '/users',
        icon: <UserIcon />,
        permission: 'users:read',
    },
];

const AppLayout = () => {
    const dispatch = useDispatch();

    const { user, permissions } = useSelector(
        (state) => state.auth
    );

    const visibleMenuItems = menuItems.filter(
        (item) =>
            !item.permission ||
            permissions.includes(item.permission)
    );

    return (
        <Box sx={{ display: 'flex', minHeight: '100vh' }}>
            <AppBar
                position="fixed"
                sx={{
                    zIndex: (theme) => theme.zIndex.drawer + 1,
                }}
            >
                <Toolbar>
                    <Typography
                        variant="h6"
                        component="div"
                        sx={{ flexGrow: 1 }}
                    >
                        Dynamic RBAC
                    </Typography>

                    <Typography sx={{ mr: 2 }}>
                        {user?.name} ({user?.role?.name})
                    </Typography>

                    <Button
                        color="inherit"
                        onClick={() => dispatch(logout())}
                    >
                        Logout
                    </Button>
                </Toolbar>
            </AppBar>

            <Drawer
                variant="permanent"
                sx={{
                    width: drawerWidth,
                    flexShrink: 0,
                    '& .MuiDrawer-paper': {
                        width: drawerWidth,
                        boxSizing: 'border-box',
                    },
                }}
            >
                <Toolbar />

                <Divider />

                <List sx={{ px: 1 }}>
                    {visibleMenuItems.map((item) => (
                        <ListItemButton
                            key={item.path}
                            component={NavLink}
                            to={item.path}
                            sx={{
                                mb: 0.5,
                                borderRadius: 1,
                                '&.active': {
                                    backgroundColor: 'primary.main',
                                    color: 'primary.contrastText',
                                    '& .MuiListItemIcon-root': {
                                        color: 'primary.contrastText',
                                    },
                                },
                            }}
                        >
                            <ListItemIcon>
                                {item.icon}
                            </ListItemIcon>

                            <ListItemText primary={item.label} />
                        </ListItemButton>
                    ))}
                </List>
            </Drawer>

            <Box
                component="main"
                sx={{
                    flexGrow: 1,
                    p: 3,
                    backgroundColor: '#f4f6f8',
                    minHeight: '100vh',
                }}
            >
                <Toolbar />
                <Outlet />
            </Box>
        </Box>
    );
};

export default AppLayout;