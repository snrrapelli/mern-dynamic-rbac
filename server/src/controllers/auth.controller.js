import User from '../models/user.model.js';
import Role from '../models/role.model.js';
import generateToken from '../utils/generate-token.js';

export const register = async (req, res) => {
    try {
        const { name, email, password, roleId } = req.body;

        if (!name || !email || !password || !roleId) {
            return res.status(400).json({
                success: false,
                message: 'Name, email, password, and roleId are required',
            });
        }

        const existingUser = await User.findOne({ email });

        if (existingUser) {
            return res.status(409).json({
                success: false,
                message: 'User already exists with this email',
            });
        }

        const role = await Role.findOne({
            _id: roleId,
            isActive: true,
        });

        if (!role) {
            return res.status(400).json({
                success: false,
                message: 'Invalid or inactive role',
            });
        }

        const user = await User.create({
            name,
            email,
            password,
            role: role._id,
        });

        const token = generateToken(user._id);

        return res.status(201).json({
            success: true,
            message: 'User registered successfully',
            data: {
                user: {
                    id: user._id,
                    name: user.name,
                    email: user.email,
                    role: {
                        id: role._id,
                        name: role.name,
                    },
                },
                token,
            },
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: 'Unable to register user',
            error: error.message,
        });
    }
};

export const login = async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({
                success: false,
                message: 'Email and password are required',
            });
        }

        const user = await User.findOne({
            email: email.toLowerCase(),
        })
            .select('+password')
            .populate('role');

        if (!user || !(await user.comparePassword(password))) {
            return res.status(401).json({
                success: false,
                message: 'Invalid email or password',
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

        const token = generateToken(user._id);

        return res.status(200).json({
            success: true,
            message: 'Login successful',
            data: {
                user: {
                    id: user._id,
                    name: user.name,
                    email: user.email,
                    role: {
                        id: user.role._id,
                        name: user.role.name,
                    },
                },
                token,
            },
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: 'Unable to log in',
            error: error.message,
        });
    }
};
    