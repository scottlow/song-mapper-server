import axios from 'axios';
import jwt from 'jsonwebtoken';
import { User } from '../models';
import *  as constants from '../constants';
import * as config from '../config';
import qs from 'qs';

function refreshSpotifyToken(user) {
  return new Promise((resolve, reject) => {
    // Request Spotify refresh token
    try {
      axios.post(constants.SPOTIFY_TOKEN_URL, qs.stringify({
        'grant_type': constants.SPOTIFY_REFRESH_TOKEN,
        'refresh_token': user.token.refreshToken
      }),
        {
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
            'Authorization': 'Basic ' + new Buffer(constants.SPOTIFY_CLIENT_ID + ':' + config.SPOTIFY_SECRET).toString('base64')
          }
        }).then(response => {
          let tokenData = response.data;
          user.token.accessToken = tokenData.access_token;
          user.token.expiresIn = tokenData.expires_in;
          user.token.grantedAt = new Date().getTime();
          user.save();
          resolve(tokenData.access_token);
        }).catch(error => {
          console.log(error);
        });
    } catch (err) {
      console.log(err);
      reject(null);
    }
  });
}

function checkRefreshToken(req, res, next) {
  var token = req.headers['x-access-token'];

  if (token == undefined) {
    next();
    return;
  }

  jwt.verify(token, config.APP_SECRET, (err, decoded) => {
    User.findById(decoded.id, (error, user) => {
      if (user) {
        axios.defaults.headers.common['Authorization'] = 'Bearer ' + user.token.accessToken;
        let expiresInMs = user.token.expiresIn * 1000;
        if (user.token.grantedAt + expiresInMs <= new Date().getTime()) {
          refreshSpotifyToken(user).then(token => {
            axios.defaults.headers.common['Authorization'] = 'Bearer ' + token;
            next();
          });
        }
      }
    });
  });
  next();
}

export { checkRefreshToken }