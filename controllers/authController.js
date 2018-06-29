import axios from 'axios';
import { URL, URLSearchParams } from 'url';
import qs from 'qs'
import { User } from '../models';
import *  as constants from '../constants';
import * as config from '../config';
import jwt from 'jsonwebtoken'
import bcrypt from 'bcryptjs'

function generateToken(userId) {
  return jwt.sign({ id: userId }, config.APP_SECRET, {
    expiresIn: "7d"
  });
}

function getRefreshToken(req, res) {
  let userId = req.body.user_id;
  if (userId) {
    let token = generateToken(userId);
    res.status(200).send({ token: token });
  } else {
    res.status(500).send();
  }
}

async function doLoginOrSignup(req, res) {

  let tokenResponse;
  let tokenData;
  let userResponse;
  let userData;

  // Request Spotify access and refresh tokens
  try {
    tokenResponse = await axios.post(constants.SPOTIFY_TOKEN_URL, qs.stringify({
      'grant_type': constants.SPOTIFY_AUTHORIZATION_CODE,
      'code': req.body.code,
      'redirect_uri': constants.SPOTIFY_REDIRECT_URL
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
    userResponse = await axios.get(constants.SPOTIFY_API_URL + '/me',
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
      displayName: userData.display_name,
      profileImageURI: userData.images[0].url,
      token: {
        accessToken: tokenData.access_token,
        refreshToken: tokenData.refresh_token,
        expiresIn: tokenData.expires_in,
        grantedAt: new Date().getTime()
      }
    }, (err, user, created) => {

      // Log errors
      if (err) {
        return res.status(500).send('There was a problem registering the user');
      }

      // Generate token used for client and server side authentication
      let token = generateToken(user.id);

      // Set auth token
      axios.defaults.headers.common['Authorization'] = 'Bearer ' + user.token.accessToken;

      // Send token back to the client for future authentication use
      res.status(200).send(
        {
          _id: user.id,
          displayName: user.displayName,
          profileImageURI: user.profileImageURI,
          token: token,
          memories: user.memories
        }
      );
    });
}

export { doLoginOrSignup, getRefreshToken }
