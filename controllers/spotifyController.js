import axios from 'axios';
import { URL, URLSearchParams } from 'url';
import qs from 'qs'
import { User, Location, Song, Memory } from '../models';
import *  as constants from '../constants';
import * as config from '../config';
import jwt from 'jsonwebtoken'
import bcrypt from 'bcryptjs'
import { checkUserToken, handleSpotifyError } from './authController';

function searchSpotify(req, res) {
    checkUserToken(req, res)
        .then(user => {
            axios.get(constants.SPOTIFY_API_URL + '/search', {
                params: {
                    'q': req.query.q,
                    'type': 'track'
                },
                headers: {
                    'Authorization': 'Bearer ' + user.accessToken
                }
            }).then(response => {
                res.status(200).send(response.data);
            }).catch(error => {
                handleSpotifyError(error, user);
            });
        })
        .catch(error => {
            console.log(error);
        });
}

function playSong(req, res) {
    checkUserToken(req, res)
        .then(user => {
            axios.put(constants.SPOTIFY_API_URL + '/me/player/play',
            {
                uris: req.body.uris
            }, 
            {
                headers: {
                    'Authorization': 'Bearer ' + user.accessToken
                },
            }).then(response => {
                res.status(200).send();
            }).catch(error => {
                handleSpotifyError(error, user);
                res.status(500).send(error.response.statusText);
            });
        });
}
export { searchSpotify, playSong }