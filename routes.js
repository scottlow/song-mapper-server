import express from 'express';
import * as authController from './controllers/authController';
import * as memoryController from './controllers/memoryController';

const router = express.Router();

// Define routes
router.route('/login').post(authController.doLoginOrSignup)
router.route('/spotify/search').get(authController.searchSpotify);
router.route('/memories/create').post(memoryController.createMemory)

export default router;