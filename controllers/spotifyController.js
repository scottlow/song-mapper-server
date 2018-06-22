import axios from 'axios';
import { URL, URLSearchParams } from 'url';
import qs from 'qs'
import { User, Location, Song, Memory } from '../models';
import *  as constants from '../constants';
import * as config from '../config';
import jwt from 'jsonwebtoken'
import bcrypt from 'bcryptjs'
import { checkUserToken } from './authController';

function searchSpotify(req, res) {
    axios.get(constants.SPOTIFY_API_URL + '/search', {
        params: {
            'q': req.query.q,
            'type': 'track'
        }
    }).then(response => {
        res.status(200).send(response.data);
    }).catch(error => {
        res.status(500).send("error");
    });
}

function playSong(req, res) {
    axios.put(constants.SPOTIFY_API_URL + '/me/player/play',
        {
            uris: req.body.uris
        }).then(response => {
            res.status(200).send();
        }).catch(error => {
            if(error.response.status == 403) {
                // This means we are out of sync with Spotify
                res.status(200).send();
            } else {
                res.status(error.response.status).send();
            }
        });
}

function getPlayerInfo(req, res) {
    axios.get(constants.SPOTIFY_API_URL + '/me/player').then(response => {
            res.status(200).send(response.data);
        }).catch(error => {
            res.status(error.response.status).send();
        });
}

function pauseSong(req, res) {
    checkUserToken(req, res)
        .then(user => {
            axios.put(constants.SPOTIFY_API_URL + '/me/player/pause').then(response => {
                res.status(200).send();
            }).catch(error => {
                if(error.response.status == 403) {
                    // This means we are out of sync with Spotify
                    res.status(200).send();
                } else {
                    res.status(error.response.status).send();
                }
            });
        });
}

function setVolume(req, res) {
    checkUserToken(req, res)
        .then(user => {
            axios.put(constants.SPOTIFY_API_URL + '/me/player/volume', undefined, {
                params: {
                    'volume_percent': req.body.volume_percent
                }
            }).then(response => {
                res.status(200).send(response.data);
            }).catch(error => {
                res.status(500).send("error");
            });
        });
}

export { searchSpotify, playSong, pauseSong, getPlayerInfo, setVolume }