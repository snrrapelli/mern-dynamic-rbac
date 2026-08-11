import { Navigate, Outlet } from 'react-router-dom';
import { useSelector } from 'react-redux';

const PermissionRoute = ({ permission }) => {
    const permissions = useSelector(
        (state) => state.auth.permissions
    );

    return permissions.includes(permission)
        ? <Outlet />
        : <Navigate to="/dashboard" replace />;
};

export default PermissionRoute;