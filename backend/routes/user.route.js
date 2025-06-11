import express from 'express'
import { protectRoute } from '../middleware/auth.middleware.js';
import { getPublicProfile, getRecommendedUser, updateProfile } from '../controllers/user.controller.js';

const router = express.Router();

router.get('/suggestions',protectRoute ,getRecommendedUser)
router.get('/:username',protectRoute ,getPublicProfile)

router.get('/profile',protectRoute ,updateProfile)

export default router;
