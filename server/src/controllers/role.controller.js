import mongoose from 'mongoose';
import Role from '../models/role.model.js';
import Permission from '../models/permission.model.js';
import User from '../models/user.model.js';

export const createRole = async (req, res) => {
    try {
        const { name, description, permissions = [] } = req.body;

        if (!name) {
            return res.status(400).json({
                success: false,
                message: 'Role name is required',
            });
        }

        if (!Array.isArray(permissions)) {
            return res.status(400).json({
                success: false,
                message: 'Permissions must be an array',
            });
        }

        const invalidPermissionId = permissions.some(
            (id) => !mongoose.isValidObjectId(id)
        );

        if (invalidPermissionId) {
            return res.status(400).json({
                success: false,
                message: 'One or more permission IDs are invalid',
            });
        }

        const existingRole = await Role.findOne({
            name: name.toLowerCase(),
        });

        if (existingRole) {
            return res.status(409).json({
                success: false,
                message: 'Role already exists',
            });
        }

        const uniquePermissionIds = [...new Set(permissions)];

        const activePermissionCount = await Permission.countDocuments({
            _id: { $in: uniquePermissionIds },
            isActive: true,
        });

        if (activePermissionCount !== uniquePermissionIds.length) {
            return res.status(400).json({
                success: false,
                message: 'One or more permissions are unavailable or inactive',
            });
        }

        const role = await Role.create({
            name,
            description,
            permissions: uniquePermissionIds,
        });

        await role.populate('permissions');

        return res.status(201).json({
            success: true,
            message: 'Role created successfully',
            data: {
                role,
            },
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: 'Unable to create role',
            error: error.message,
        });
    }
};

export const getRoles = async (req, res) => {
    try {
        const roles = await Role.find()
            .populate('permissions')
            .sort({ name: 1 });

        return res.status(200).json({
            success: true,
            message: 'Roles fetched successfully',
            results: roles.length,
            data: {
                roles,
            },
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: 'Unable to fetch roles',
            error: error.message,
        });
    }
};

export const getRoleById = async (req, res) => {
    try {
        const { id } = req.params;

        if (!mongoose.isValidObjectId(id)) {
            return res.status(400).json({
                success: false,
                message: 'Invalid role ID',
            });
        }

        const role = await Role.findById(id).populate('permissions');

        if (!role) {
            return res.status(404).json({
                success: false,
                message: 'Role not found',
            });
        }

        return res.status(200).json({
            success: true,
            message: 'Role fetched successfully',
            data: {
                role,
            },
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: 'Unable to fetch role',
            error: error.message,
        });
    }
};

export const updateRole = async (req, res) => {
    try {
        const { id } = req.params;
        const { name, description, permissions, isActive } = req.body;

        if (!mongoose.isValidObjectId(id)) {
            return res.status(400).json({
                success: false,
                message: 'Invalid role ID',
            });
        }

        const role = await Role.findById(id);

        if (!role) {
            return res.status(404).json({
                success: false,
                message: 'Role not found',
            });
        }

        if (name && name.toLowerCase() !== role.name) {
            const existingRole = await Role.findOne({
                name: name.toLowerCase(),
                _id: { $ne: id },
            });

            if (existingRole) {
                return res.status(409).json({
                    success: false,
                    message: 'Role already exists with this name',
                });
            }
        }

        if (permissions !== undefined) {
            if (!Array.isArray(permissions)) {
                return res.status(400).json({
                    success: false,
                    message: 'Permissions must be an array',
                });
            }

            const invalidPermissionId = permissions.some(
                (permissionId) =>
                    !mongoose.isValidObjectId(permissionId)
            );

            if (invalidPermissionId) {
                return res.status(400).json({
                    success: false,
                    message: 'One or more permission IDs are invalid',
                });
            }

            const uniquePermissionIds = [...new Set(permissions)];

            const activePermissionCount =
                await Permission.countDocuments({
                    _id: { $in: uniquePermissionIds },
                    isActive: true,
                });

            if (activePermissionCount !== uniquePermissionIds.length) {
                return res.status(400).json({
                    success: false,
                    message:
                        'One or more permissions are unavailable or inactive',
                });
            }

            role.permissions = uniquePermissionIds;
        }

        if (name !== undefined) role.name = name;
        if (description !== undefined) role.description = description;
        if (isActive !== undefined) role.isActive = isActive;

        await role.save();
        await role.populate('permissions');

        return res.status(200).json({
            success: true,
            message: 'Role updated successfully',
            data: {
                role,
            },
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: 'Unable to update role',
            error: error.message,
        });
    }
};

export const deleteRole = async (req, res) => {
    try {
        const { id } = req.params;

        if (!mongoose.isValidObjectId(id)) {
            return res.status(400).json({
                success: false,
                message: 'Invalid role ID',
            });
        }

        const role = await Role.findById(id);

        if (!role) {
            return res.status(404).json({
                success: false,
                message: 'Role not found',
            });
        }

        const assignedUser = await User.exists({
            role: id,
        });

        if (assignedUser) {
            return res.status(409).json({
                success: false,
                message: 'Cannot delete role because it is assigned to a user',
            });
        }

        await role.deleteOne();

        return res.status(200).json({
            success: true,
            message: 'Role deleted successfully',
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: 'Unable to delete role',
            error: error.message,
        });
    }
};

export const getRoleOptions = async (req, res, next,) => {
    try {
        const roles = await Role.find({
            isActive: true,
        })
            .select('_id name')
            .sort({ name: 1 })
            .lean();

        return res.status(200).json({
            success: true,
            message: 'Active role options fetched successfully',
            data: {
                roles,
            },
        });
    } catch (error) {
        next(error);
    }
};
