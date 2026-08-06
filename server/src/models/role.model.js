import mongoose from 'mongoose';

const roleSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: [true, 'Role name is required'],
            unique: true,
            trim: true,
            lowercase: true,
        },
        description: {
            type: String,
            trim: true,
            default: '',
        },
        permissions: [
            {
                type: mongoose.Schema.Types.ObjectId,
                ref: 'Permission',
            },
        ],
        isActive: {
            type: Boolean,
            default: true,
        },
    },
    {
        timestamps: true,
    }
);

const Role = mongoose.model('Role', roleSchema);

export default Role;