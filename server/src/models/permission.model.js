import mongoose from 'mongoose';

const permissionSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: [true, 'Permission name is required'],
            unique: true,
            trim: true,
            lowercase: true,
        },
        description: {
            type: String,
            trim: true,
            default: '',
        },
        resource: {
            type: String,
            required: [true, 'Resource is required'],
            trim: true,
            lowercase: true,
        },
        action: {
            type: String,
            required: [true, 'Action is required'],
            trim: true,
            lowercase: true,
            enum: ['create', 'read', 'update', 'delete'],
        },
        isActive: {
            type: Boolean,
            default: true,
        },
    },
    {
        timestamps: true,
    }
);

const Permission = mongoose.model('Permission', permissionSchema);

export default Permission;