import axios from 'axios';
import { URL, URLSearchParams } from 'url';
import qs from 'qs'
import { User, Location, Song, Memory } from '../models';
import *  as constants from '../constants';
import * as config from '../config';
import jwt from 'jsonwebtoken'
import bcrypt from 'bcryptjs'
import { checkUserToken } from './authController';

function getMemories(req, res) {
    let memories = Memory.find({}, (err, memories) => {
        res.send(memories);
    });
}

function createMemory(req, res) {
    checkUserToken(req, res)
        .then(user => {
            let data = req.body.data;
            let memoryLocation = data.location;
            let song = data.song;

            // Get or create the location object associated with this memory
            Location.findOrCreate(
            {
                gId: memoryLocation.gId
            },
            {
                name: memoryLocation.name,
                address: memoryLocation.address,
                lat: memoryLocation.location.lat,
                long: memoryLocation.location.long
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

                    memory.save();

                    user.memories.push(memory);
                    user.save();

                    res.status(200).send();
                });
            });
        });
}

export { createMemory, getMemories }
