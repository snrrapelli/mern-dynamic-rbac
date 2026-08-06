import express from 'express';
import {
    createPermission,
    getPermissions,
    getPermissionById,
    updatePermission,
    deletePermission
} from '../controllers/permission.controller.js';

const router = express.Router();

router.route('/')
    .post(createPermission)
    .get(getPermissions);

router.route('/:id')
    .get(getPermissionById)
    .patch(updatePermission)
    .delete(deletePermission);

export default router;