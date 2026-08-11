import 'dotenv/config';
import mongoose from 'mongoose';
import connectDB from '../config/db.js';
import Permission from '../models/permission.model.js';
import Role from '../models/role.model.js';
import User from '../models/user.model.js';

const resources = ['permissions', 'roles', 'users'];
const actions = ['create', 'read', 'update', 'delete'];

const seedAdmin = async () => {
    try {
        await connectDB();

        const permissionIds = [];

        for (const resource of resources) {
            for (const action of actions) {
                const name = `${resource}:${action}`;

                const permission = await Permission.findOneAndUpdate(
                    { name },
                    {
                        $set: {
                            description: `Allows ${action} access to ${resource}`,
                            resource,
                            action,
                            isActive: true,
                        },
                    },
                    {
                        new: true,
                        upsert: true,
                        runValidators: true,
                    }
                );

                permissionIds.push(permission._id);
            }
        }

        const superAdminRole = await Role.findOneAndUpdate(
            { name: 'super-admin' },
            {
                $set: {
                    description: 'Has complete access to the application',
                    permissions: permissionIds,
                    isActive: true,
                },
            },
            {
                new: true,
                upsert: true,
                runValidators: true,
            }
        );

        const adminEmail = process.env.ADMIN_EMAIL;
        const adminPassword = process.env.ADMIN_PASSWORD;
        const adminName = process.env.ADMIN_NAME || 'Super Admin';

        if (!adminEmail || !adminPassword) {
            throw new Error(
                'ADMIN_EMAIL and ADMIN_PASSWORD must be provided in the .env file'
            );
        }

        const existingAdmin = await User.findOne({ email: adminEmail });

        if (existingAdmin) {
            existingAdmin.name = adminName;
            existingAdmin.role = superAdminRole._id;
            existingAdmin.isActive = true;

            await existingAdmin.save();

            console.log('Existing admin user updated');
        } else {
            await User.create({
                name: adminName,
                email: adminEmail,
                password: adminPassword,
                role: superAdminRole._id,
                isActive: true,
            });

            console.log('Initial admin user created');
        }

        console.log(`${permissionIds.length} permissions seeded`);
        console.log('Super-admin role seeded');
        console.log('Admin seed completed successfully');
    } catch (error) {
        console.error('Admin seed failed:', error.message);
        process.exitCode = 1;
    } finally {
        await mongoose.connection.close();
    }
};

seedAdmin();