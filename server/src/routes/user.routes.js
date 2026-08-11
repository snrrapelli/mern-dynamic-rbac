import express from 'express';
import {
    createUser,
    getUsers,
    getUserById,
    updateUser,
    deleteUser,
    getMyProfile,
} from '../controllers/user.controller.js';
import { protect } from '../middleware/auth.middleware.js';
import { authorize } from '../middleware/authorize.middleware.js';

const router = express.Router();

router.get('/me', protect, getMyProfile);

router.post('/', protect, authorize('users:create'), createUser);

router.get('/', protect, authorize('users:read'), getUsers);

router.get('/:id', protect, authorize('users:read'), getUserById);

router.patch('/:id', protect, authorize('users:update'), updateUser);

router.delete('/:id', protect, authorize('users:delete'), deleteUser);

export default router;