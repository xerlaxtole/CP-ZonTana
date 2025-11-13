import express from 'express';

import { getAllUsers, getUser, updateAvatar } from '../controllers/user.js';

const router = express.Router();

router.get('/', getAllUsers);
router.get('/:username', getUser);
router.patch('/avatar', updateAvatar);

export default router;
