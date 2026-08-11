import express from 'express';
import {
    createRole,
    getRoles,
    getRoleById,
    updateRole,
    deleteRole,
    getRoleOptions,
} from '../controllers/role.controller.js';
import { protect } from '../middleware/auth.middleware.js';
import { authorize, authorizeAny } from '../middleware/authorize.middleware.js';

const router = express.Router();

// router.route('/')
//     .post(createRole)
//     .get(getRoles);

// router.route('/:id')
//     .get(getRoleById)
//     .patch(updateRole)
//     .delete(deleteRole);

router.post('/', protect, authorize('roles:create'), createRole);

router.get('/', protect, authorize('roles:read'), getRoles);

router.get(
    '/options',
    protect,
    authorizeAny('users:create', 'users:update'),
    getRoleOptions
);

router.get('/:id', protect, authorize('roles:read'), getRoleById);

router.patch('/:id', protect, authorize('roles:update'), updateRole);

router.delete('/:id', protect, authorize('roles:delete'), deleteRole);

export default router;