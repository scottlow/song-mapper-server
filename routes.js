import express from 'express';
import * as authController from './controllers/authController';
import * as memoryController from './controllers/memoryController';
import * as spotifyController from './controllers/spotifyController';

const router = express.Router();

// Define routes
router.route('/login').post(authController.doLoginOrSignup)
router.route('/spotify/search').get(spotifyController.searchSpotify);
router.route('/spotify/playback/play').post(spotifyController.playSong);
router.route('/memories/create').post(memoryController.createMemory);
router.route('/memories').get(memoryController.getMemories);
router.route('/memories/location/:locationGID').get(memoryController.getMemoriesAtLocation);

export default router;