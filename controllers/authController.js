import axios from 'axios';
import { URL, URLSearchParams} from 'url';
import qs from 'qs'
import { User } from '../models';
import *  as constants from '../constants';
import * as config from '../config';
import jwt from 'jsonwebtoken'
import bcrypt from 'bcryptjs'

async function requestSpotifyTokens(req, res) {

  let tokenResponse;
  let tokenData;
  let userResponse;
  let userData;

  // Request Spotify access and refresh tokens
  try {
    tokenResponse = await axios.post(constants.SPOTIFY_TOKEN_URL, qs.stringify({
      'grant_type' : constants.SPOTIFY_GRANT_TYPE,
      'code': req.body.code,
      'redirect_uri' : constants.SPOTIFY_REDIRECT_URL
    }),
    {
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Authorization': 'Basic ' + new Buffer(constants.SPOTIFY_CLIENT_ID + ':' + config.SPOTIFY_SECRET).toString('base64')
      }
    });

    tokenData = tokenResponse.data;
  } catch (err) {
    console.log(err);
    return res.status(500).send();
  }

  // Request user data
  try {
    userResponse = await axios.get(constants.SPOTIFY_API_URL + '/v1/me', 
    {
      headers: {
        'Authorization': tokenData.token_type + ' ' + tokenData.access_token
      }
    });

    userData = userResponse.data;
  } catch (err) {
      console.log(err);
      return res.status(500).send(); 
  }

  // Find or create a user object to authenticate on the client
  User.findOrCreate(
    {
      email: userData.email
    },
    {
      displayName: userData.diplay_name, 
      profileImageURI: userData.images[0].url,
      accessToken: tokenData.access_token,
      refreshToken: tokenData.refresh_token
    }, (err, user, created) => {

      // Log errors
      if(err) {
        return res.status(500).send('There was a problem registering the user');
      }

      // Generate token used for client and server side authentication
      var token = jwt.sign({ id: user.id }, config.APP_SECRET, {
        expiresIn: 86400
      });

      // Send token back to the client for future authentication use
      res.status(200).send({ auth: true, token: token });
    });
}

export { requestSpotifyTokens }
