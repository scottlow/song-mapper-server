import axios from 'axios';
import { URL, URLSearchParams } from 'url';
import qs from 'qs'
import { User, Location, Song, Memory } from '../models';
import *  as constants from '../constants';
import * as config from '../config';
import jwt from 'jsonwebtoken'
import bcrypt from 'bcryptjs'
import { checkUserToken } from './authController';

function getCurrentUserMemories(req, res) {
    checkUserToken(req, res)
        .then(user => {
            // Required since MongoDB objects are immutable
            let userMemories = user.memories.toObject();
            userMemories.forEach(memory => {
                memory.song.isSavedByCurrentUser = true;
            });
            res.send(userMemories);
        });
}

function getMemories(req, res) {
    let memories = Memory.find({}, (err, memories) => {
        res.send(memories);
    });
}

function getMemoriesAtLocation(req, res) {
    let memories = Memory.find({ 'location.gId': req.params.locationGID }, (err, memories) => {
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
                    pinLocation: {
                        lat: memoryLocation.pinLocation.lat,
                        long: memoryLocation.pinLocation.long
                    }
                },
                (locationError, location, didCreateLocation) => {

                    // Log errors
                    if (locationError) {
                        return res.status(500).send('There was a problem getting the location');
                    }

                    // Get or create the song object associated with this memory
                    Song.findOrCreate(
                        {
                            spotifyURI: song.spotifyURI
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

function deleteMemory(req, res) {
    checkUserToken(req, res)
        .then(user => {
            Memory.findByIdAndRemove(req.query.memoryId, (err, memory) => {
                if (err) {
                    console.log(err);
                    return res.status(500).send('There was a problem finding the memory to delete');
                } else {
                    console.log(memory);
                    console.log(user);
                    User.update({ '_id': user.id }, { '$pull': { 'memories': { _id: req.query.memoryId } } }, (updateErr, numAffected) => {
                        if (updateErr) {
                            console.log(updateErr);
                            return res.status(500).send('There was a problem updating the users\' memories after deleting');
                        }
                        res.status(200).send();
                    });
                }
            });
        });
}

export {
    createMemory,
    getMemories,
    getMemoriesAtLocation,
    getCurrentUserMemories,
    deleteMemory
}
