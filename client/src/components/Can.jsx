import { useSelector } from 'react-redux';

const Can = ({ permission, children, fallback = null }) => {
    const permissions = useSelector(
        (state) => state.auth.permissions
    );

    const hasPermission = permissions.includes(permission);

    return hasPermission ? children : fallback;
};

export default Can;