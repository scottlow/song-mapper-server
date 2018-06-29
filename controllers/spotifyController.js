import axios from 'axios';
import *  as constants from '../constants';

function searchSpotify(req, res) {
    axios.get(constants.SPOTIFY_API_URL + '/search', {
        params: {
            'q': req.query.q,
            'type': 'track'
        }
    }).then(response => {
        res.status(200).send(response.data);
    }).catch(error => {
        res.status(500).send("Error searching Spotify");
    });
}

function getDeviceList(req, res) {
    if (res.locals.isAuthenticated) {
        axios.get(constants.SPOTIFY_API_URL + '/me/player/devices')
            .then(response => {
                res.status(200).send(response.data);
            }).catch(error => {
                res.status(500).send("Error getting users' devices");
            });
    }
}

function setPlayer(req, res) {
    if (res.locals.isAuthenticated) {
        axios.put(constants.SPOTIFY_API_URL + '/me/player',
            {
                device_ids: req.body.device_ids
            }).then(() => {
                res.status(200).send();
            }).catch(error => {
                if (error.response.status == 403) {
                    // This means we are out of sync with Spotify
                    res.status(200).send();
                } else {
                    res.status(error.response.status).send();
                }
            });
    }
}

function playSong(req, res) {
    if (res.locals.isAuthenticated) {
        let user = res.locals.user;
        axios.put(constants.SPOTIFY_API_URL + '/me/player/play',
            {
                uris: req.body.uris
            }).then(() => {
                res.status(200).send();
            }).catch(error => {
                if (error.response.status == 403) {
                    // This means we are out of sync with Spotify
                    res.status(200).send();
                } else {
                    res.status(error.response.status).send();
                }
            });
    }
}

function getPlayerInfo(req, res) {
    if (res.locals.isAuthenticated) {
        let user = res.locals.user;
        axios.get(constants.SPOTIFY_API_URL + '/me/player').then(response => {
            res.status(200).send(response.data);
        }).catch(error => {
            res.status(error.response.status).send();
        });
    }
}

function pauseSong(req, res) {
    if (res.locals.isAuthenticated) {
        let user = res.locals.user;
        axios.put(constants.SPOTIFY_API_URL + '/me/player/pause').then(response => {
            res.status(200).send();
        }).catch(error => {
            if (error.response.status == 403) {
                // This means we are out of sync with Spotify
                res.status(200).send();
            } else {
                res.status(error.response.status).send();
            }
        });
    }
}

function setVolume(req, res) {
    if (res.locals.isAuthenticated) {
        axios.put(constants.SPOTIFY_API_URL + '/me/player/volume', undefined, {
            params: {
                'volume_percent': req.body.volume_percent
            }
        }).then(response => {
            res.status(200).send(response.data);
        }).catch(error => {
            res.status(500).send("error");
        });
    }
}

export { searchSpotify, playSong, pauseSong, getPlayerInfo, setVolume, getDeviceList, setPlayer }