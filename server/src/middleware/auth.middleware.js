import jwt from 'jsonwebtoken';
import User from '../models/user.model.js';

export const protect = async (req, res, next) => {
    try {
        const authorizationHeader = req.headers.authorization;

        if (
            !authorizationHeader ||
            !authorizationHeader.startsWith('Bearer ')
        ) {
            return res.status(401).json({
                success: false,
                message: 'Authentication token is required',
            });
        }

        const token = authorizationHeader.split(' ')[1];

        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        const user = await User.findById(decoded.userId).populate({
            path: 'role',
            populate: {
                path: 'permissions',
            },
        });

        if (!user) {
            return res.status(401).json({
                success: false,
                message: 'User associated with this token no longer exists',
            });
        }

        if (!user.isActive) {
            return res.status(403).json({
                success: false,
                message: 'Your account is inactive',
            });
        }

        if (!user.role || !user.role.isActive) {
            return res.status(403).json({
                success: false,
                message: 'Your assigned role is inactive or unavailable',
            });
        }

        req.user = user;
        next();
    } catch (error) {
        if (error.name === 'TokenExpiredError') {
            return res.status(401).json({
                success: false,
                message: 'Authentication token has expired',
            });
        }

        if (error.name === 'JsonWebTokenError') {
            return res.status(401).json({
                success: false,
                message: 'Invalid authentication token',
            });
        }

        return res.status(500).json({
            success: false,
            message: 'Unable to authenticate user',
            error: error.message,
        });
    }
};