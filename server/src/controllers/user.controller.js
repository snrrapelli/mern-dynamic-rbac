import mongoose from 'mongoose';
import User from '../models/user.model.js';
import Role from '../models/role.model.js';

export const getMyProfile = async (req, res) => {
    return res.status(200).json({
        success: true,
        message: 'Profile fetched successfully',
        data: {
            user: {
                id: req.user._id,
                name: req.user.name,
                email: req.user.email,
                role: req.user.role,
            },
        },
    });
};

export const createUser = async (req, res) => {
    try {
        const { name, email, password, role, isActive } = req.body;

        if (!name || !email || !password || !role) {
            return res.status(400).json({
                success: false,
                message: 'Name, email, password and role are required',
            });
        }

        if (!mongoose.isValidObjectId(role)) {
            return res.status(400).json({
                success: false,
                message: 'Invalid role ID',
            });
        }

        const existingUser = await User.findOne({
            email: email.toLowerCase(),
        });

        if (existingUser) {
            return res.status(409).json({
                success: false,
                message: 'User already exists with this email',
            });
        }

        const assignedRole = await Role.findOne({
            _id: role,
            isActive: true,
        });

        if (!assignedRole) {
            return res.status(400).json({
                success: false,
                message: 'Assigned role is unavailable or inactive',
            });
        }

        const user = await User.create({
            name,
            email,
            password,
            role,
            isActive,
        });

        await user.populate('role');
        user.password = undefined;

        return res.status(201).json({
            success: true,
            message: 'User created successfully',
            data: {
                user,
            },
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: 'Unable to create user',
            error: error.message,
        });
    }
};

export const getUsers = async (req, res) => {
    try {
        const users = await User.find()
            .populate('role')
            .sort({ createdAt: -1 });

        return res.status(200).json({
            success: true,
            message: 'Users fetched successfully',
            results: users.length,
            data: {
                users,
            },
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: 'Unable to fetch users',
            error: error.message,
        });
    }
};

export const getUserById = async (req, res) => {
    try {
        const { id } = req.params;

        if (!mongoose.isValidObjectId(id)) {
            return res.status(400).json({
                success: false,
                message: 'Invalid user ID',
            });
        }

        const user = await User.findById(id).populate('role');

        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found',
            });
        }

        return res.status(200).json({
            success: true,
            message: 'User fetched successfully',
            data: {
                user,
            },
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: 'Unable to fetch user',
            error: error.message,
        });
    }
};

export const updateUser = async (req, res) => {
    try {
        const { id } = req.params;
        const { name, email, password, role, isActive } = req.body;

        if (!mongoose.isValidObjectId(id)) {
            return res.status(400).json({
                success: false,
                message: 'Invalid user ID',
            });
        }

        const user = await User.findById(id).select('+password');

        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found',
            });
        }

        if (email !== undefined) {
            const normalizedEmail = email.toLowerCase();

            const existingUser = await User.findOne({
                email: normalizedEmail,
                _id: { $ne: id },
            });

            if (existingUser) {
                return res.status(409).json({
                    success: false,
                    message: 'Another user already exists with this email',
                });
            }

            user.email = normalizedEmail;
        }

        if (role !== undefined) {
            if (!mongoose.isValidObjectId(role)) {
                return res.status(400).json({
                    success: false,
                    message: 'Invalid role ID',
                });
            }

            const assignedRole = await Role.findOne({
                _id: role,
                isActive: true,
            });

            if (!assignedRole) {
                return res.status(400).json({
                    success: false,
                    message: 'Assigned role is unavailable or inactive',
                });
            }

            user.role = role;
        }

        if (name !== undefined) user.name = name;
        if (password !== undefined) user.password = password;
        if (isActive !== undefined) user.isActive = isActive;

        await user.save();
        await user.populate('role');

        user.password = undefined;

        return res.status(200).json({
            success: true,
            message: 'User updated successfully',
            data: {
                user,
            },
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: 'Unable to update user',
            error: error.message,
        });
    }
};

export const deleteUser = async (req, res) => {
    try {
        const { id } = req.params;

        if (!mongoose.isValidObjectId(id)) {
            return res.status(400).json({
                success: false,
                message: 'Invalid user ID',
            });
        }

        if (req.user._id.toString() === id) {
            return res.status(400).json({
                success: false,
                message: 'You cannot delete your own account',
            });
        }

        const user = await User.findById(id);

        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found',
            });
        }

        await user.deleteOne();

        return res.status(200).json({
            success: true,
            message: 'User deleted successfully',
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: 'Unable to delete user',
            error: error.message,
        });
    }
};