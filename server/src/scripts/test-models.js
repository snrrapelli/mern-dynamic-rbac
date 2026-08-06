import 'dotenv/config';
import mongoose from 'mongoose';

import Permission from '../models/permission.model.js';
import Role from '../models/role.model.js';
import User from '../models/user.model.js';

const testModels = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('MongoDB connected');

        // Remove only previous test records
        await User.deleteOne({ email: 'rbac.test@example.com' });
        await Role.deleteOne({ name: 'test-admin' });
        await Permission.deleteOne({ name: 'users:read:test' });

        const permission = await Permission.create({
            name: 'users:read:test',
            description: 'Allows reading users during model testing',
            resource: 'users',
            action: 'read',
        });

        const role = await Role.create({
            name: 'test-admin',
            description: 'Temporary role used for model testing',
            permissions: [permission._id],
        });

        const user = await User.create({
            name: 'RBAC Test User',
            email: 'rbac.test@example.com',
            password: 'TestPassword123',
            role: role._id,
        });

        const storedUser = await User.findById(user._id)
            .select('+password')
            .populate({
                path: 'role',
                populate: {
                    path: 'permissions',
                },
            });

        const passwordMatches =
            await storedUser.comparePassword('TestPassword123');

        console.log('User created:', storedUser.email);
        console.log('Assigned role:', storedUser.role.name);
        console.log(
            'Permissions:',
            storedUser.role.permissions.map((item) => item.name)
        );
        console.log('Password is hashed:', storedUser.password !== 'TestPassword123');
        console.log('Password comparison:', passwordMatches);

        // Clean up temporary data
        await User.deleteOne({ _id: user._id });
        await Role.deleteOne({ _id: role._id });
        await Permission.deleteOne({ _id: permission._id });

        console.log('Test data cleaned successfully');
    } catch (error) {
        console.error('Model test failed:', error.message);
        process.exitCode = 1;
    } finally {
        await mongoose.disconnect();
    }
};

testModels();