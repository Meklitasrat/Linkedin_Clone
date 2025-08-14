import express from 'express'
import { protectRoute } from '../middleware/auth.middleware.js';
import { acceptConnectionRequest, getConnectionStatus, getUserConnectionRequests, getUserConnections, rejectConnectionRequest, removeConnection, sendConnectionRequest } from '../controllers/connection.controller.js';

const router = express.Router();

router.post('/request/:userId', protectRoute, sendConnectionRequest)
router.put('/accept/:requestId', protectRoute , acceptConnectionRequest)
router.put('/reject/:requestId', protectRoute , rejectConnectionRequest)
router.get('/requests', protectRoute , getUserConnectionRequests)
router.get('/', protectRoute , getUserConnections);
router.delete('/:userId', protectRoute , removeConnection);
router.get('/status/:userId', protectRoute, getConnectionStatus)

export default router;