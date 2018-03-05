import express from 'express';
import * as authController from './controllers/authController';

const router = express.Router();

// Define routes
router.route('/login').post(authController.requestSpotifyTokens)

export default router;