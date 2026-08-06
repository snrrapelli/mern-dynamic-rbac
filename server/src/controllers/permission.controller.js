import Permission from '../models/permission.model.js';
import Role from '../models/role.model.js';
import mongoose from 'mongoose';

export const createPermission = async (req, res) => {
    try {
        const { name, description, resource, action } = req.body;

        if (!name || !resource || !action) {
            return res.status(400).json({
                success: false,
                message: 'Name, resource, and action are required',
            });
        }

        const existingPermission = await Permission.findOne({
            name: name.toLowerCase(),
        });

        if (existingPermission) {
            return res.status(409).json({
                success: false,
                message: 'Permission already exists',
            });
        }

        const permission = await Permission.create({
            name,
            description,
            resource,
            action,
        });

        return res.status(201).json({
            success: true,
            message: 'Permission created successfully',
            data: {
                permission,
            },
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: 'Unable to create permission',
            error: error.message,
        });
    }
};

export const getPermissions = async (req, res) => {
    try {
        const permissions = await Permission.find()
            .sort({ resource: 1, action: 1 });

        return res.status(200).json({
            success: true,
            message: 'Permissions fetched successfully',
            results: permissions.length,
            data: {
                permissions,
            },
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: 'Unable to fetch permissions',
            error: error.message,
        });
    }
};

export const getPermissionById = async (req, res) => {
    try {
        const { id } = req.params;

        if (!mongoose.isValidObjectId(id)) {
            return res.status(400).json({
                success: false,
                message: 'Invalid permission ID',
            });
        }

        const permission = await Permission.findById(id);

        if (!permission) {
            return res.status(404).json({
                success: false,
                message: 'Permission not found',
            });
        }

        return res.status(200).json({
            success: true,
            message: 'Permission fetched successfully',
            data: {
                permission,
            },
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: 'Unable to fetch permission',
            error: error.message,
        });
    }
};

export const updatePermission = async (req, res) => {
    try {
        const { id } = req.params;
        const { name, description, resource, action, isActive } = req.body;

        if (!mongoose.isValidObjectId(id)) {
            return res.status(400).json({
                success: false,
                message: 'Invalid permission ID',
            });
        }

        const permission = await Permission.findById(id);

        if (!permission) {
            return res.status(404).json({
                success: false,
                message: 'Permission not found',
            });
        }

        if (name && name.toLowerCase() !== permission.name) {
            const existingPermission = await Permission.findOne({
                name: name.toLowerCase(),
                _id: { $ne: id },
            });

            if (existingPermission) {
                return res.status(409).json({
                    success: false,
                    message: 'Permission already exists with this name',
                });
            }
        }

        if (name !== undefined) permission.name = name;
        if (description !== undefined) permission.description = description;
        if (resource !== undefined) permission.resource = resource;
        if (action !== undefined) permission.action = action;
        if (isActive !== undefined) permission.isActive = isActive;

        await permission.save();

        return res.status(200).json({
            success: true,
            message: 'Permission updated successfully',
            data: {
                permission,
            },
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: 'Unable to update permission',
            error: error.message,
        });
    }
};

export const deletePermission = async (req, res) => {
    try {
        const { id } = req.params;

        if (!mongoose.isValidObjectId(id)) {
            return res.status(400).json({
                success: false,
                message: 'Invalid permission ID',
            });
        }

        const permission = await Permission.findById(id);

        if (!permission) {
            return res.status(404).json({
                success: false,
                message: 'Permission not found',
            });
        }

        const assignedRole = await Role.exists({
            permissions: id,
        });

        if (assignedRole) {
            return res.status(409).json({
                success: false,
                message: 'Cannot delete permission because it is assigned to a role',
            });
        }

        await permission.deleteOne();

        return res.status(200).json({
            success: true,
            message: 'Permission deleted successfully',
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: 'Unable to delete permission',
            error: error.message,
        });
    }
};
