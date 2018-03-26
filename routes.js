import express from 'express';
import * as authController from './controllers/authController';
import * as memoryController from './controllers/memoryController';
import * as spotifyController from './controllers/spotifyController';
import * as tokenMiddleware from './middleware/tokenMiddleware';

const router = express.Router();

// Define routes
router.route('/login').post(authController.doLoginOrSignup)
router.route('/spotify/search').get(tokenMiddleware.checkRefreshToken, spotifyController.searchSpotify);
router.route('/spotify/playback/play').post(tokenMiddleware.checkRefreshToken, spotifyController.playSong);
router.route('/spotify/playback/pause').post(tokenMiddleware.checkRefreshToken, spotifyController.pauseSong);
router.route('/spotify/playback').get(tokenMiddleware.checkRefreshToken, spotifyController.getPlayerInfo);
router.route('/memories/create').post(tokenMiddleware.checkRefreshToken, memoryController.createMemory);
router.route('/memories').get(tokenMiddleware.checkRefreshToken, memoryController.getMemories);
router.route('/memories/location/:locationGID').get(tokenMiddleware.checkRefreshToken, memoryController.getMemoriesAtLocation);

export default router;