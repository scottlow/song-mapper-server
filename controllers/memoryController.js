import axios from 'axios';
import { URL, URLSearchParams } from 'url';
import qs from 'qs'
import { User, Location, Song, Memory } from '../models';
import *  as constants from '../constants';
import * as config from '../config';
import jwt from 'jsonwebtoken'
import bcrypt from 'bcryptjs'
import { checkUserToken } from './authController';

function createMemory(req, res) {
    checkUserToken(req, res)
        .then(user => {
            let data = req.body.data;
            let location = data.location;
            let song = data.song;

            // Get or create the location object associated with this memory
            Location.findOrCreate(
            {
                gId: location.gId
            },
            {
                name: location.name,
                address: location.address,
                lat: location.lat,
                long: location.long
            },
            (locationError, location, didCreateLocation) => {

                // Log errors
                if (locationError) {
                    return res.status(500).send('There was a problem getting the location');
                }

                // Get or create the song object associated with this memory
                Song.findOrCreate(
                {
                    id: song.id
                },
                {
                    title: song.title,
                    artist: song.artist,
                    spotifyURI: song.spotifyURI,
                    albumArtURI: song.albumArtURI
                },
                (songError, song, didCreateSong) => {
                    let memory = new Memory({
                        song: song,
                        location: location
                    });

                    user.memories.push(memory);
                    user.save();

                    res.status(200).send();
                });
            });
        });
}

export { createMemory }
