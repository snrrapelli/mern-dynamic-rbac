export const authorize = (...requiredPermissions) => {
    return (req, res, next) => {
        if (!req.user?.role) {
            return res.status(403).json({
                success: false,
                message: 'Access denied: role not available',
            });
        }

        const userPermissions = req.user.role.permissions
            .filter((permission) => permission.isActive)
            .map((permission) => permission.name);

        const hasPermission = requiredPermissions.every((permission) =>
            userPermissions.includes(permission)
        );

        if (!hasPermission) {
            return res.status(403).json({
                success: false,
                message: 'You do not have permission to perform this action',
            });
        }

        next();
    };
};

export const authorizeAny = (...requiredPermissions) => {
    return (req, res, next) => {
        if (!req.user?.role) {
            return res.status(403).json({
                success: false,
                message: 'Access denied: role not available',
            });
        }

        const userPermissions = req.user.role.permissions
            .filter((permission) => permission.isActive)
            .map((permission) => permission.name);

        const hasPermission = requiredPermissions.some((permission) =>
            userPermissions.includes(permission)
        );

        if (!hasPermission) {
            return res.status(403).json({
                success: false,
                message: 'You do not have permission to perform this action',
            });
        }

        next();
    };
};