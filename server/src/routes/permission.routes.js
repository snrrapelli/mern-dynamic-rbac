import express from 'express';
import {
    createPermission,
    getPermissions,
    getPermissionById,
    updatePermission,
    deletePermission
} from '../controllers/permission.controller.js';
import { protect } from '../middleware/auth.middleware.js';
import { authorize } from '../middleware/authorize.middleware.js';

const router = express.Router();

router.post(
    '/',
    protect,
    authorize('permissions:create'),
    createPermission
);

router.get(
    '/',
    protect,
    authorize('permissions:read'),
    getPermissions
);

router.get(
    '/:id',
    protect,
    authorize('permissions:read'),
    getPermissionById
);

router.patch(
    '/:id',
    protect,
    authorize('permissions:update'),
    updatePermission
);

router.delete(
    '/:id',
    protect,
    authorize('permissions:delete'),
    deletePermission
);

export default router;