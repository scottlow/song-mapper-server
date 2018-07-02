import { User, Location, Song, Memory } from '../models';

function getCurrentUserMemories(req, res) {
    if (res.locals.isAuthenticated) {
        let user = res.locals.user;
        let userMemories = user.memories.toObject().sort(function (a, b) { return new Date(b.createdAt) - new Date(a.createdAt); });
        userMemories.forEach(memory => {
            memory.song.isSavedByCurrentUser = true;
        });
        res.send(userMemories);
    }
}

function getMemories(req, res) {
    Memory.find({}, (err, memories) => {
        res.send(memories);
    });
}

function getMemoriesAtLocation(req, res) {
    Memory.find({ 'location.gId': req.params.locationGID }, (err, memories) => {
        res.send(memories);
    });
}

function createMemory(req, res) {
    if (res.locals.isAuthenticated) {
        let user = res.locals.user;
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

                        memory.save((err) => {
                            if (err) res.status(500).send();

                            user.memories.push(memory);
                            user.save();
                            res.status(200).send(memory);
                        });
                    });
            });
    }
}

function deleteMemory(req, res) {
    if (res.locals.isAuthenticated) {
        let user = res.locals.user;
        Memory.findByIdAndRemove(req.query.memoryId, (err, memory) => {
            if (err) {
                console.log(err);
                return res.status(500).send('There was a problem finding the memory to delete');
            } else {
                User.update({ '_id': user.id }, { '$pull': { 'memories': { _id: req.query.memoryId } } }, (updateErr, numAffected) => {
                    if (updateErr) {
                        console.log(updateErr);
                        return res.status(500).send('There was a problem updating the users\' memories after deleting');
                    }
                    res.status(200).send();
                });
            }
        });
    }
}

export {
    createMemory,
    getMemories,
    getMemoriesAtLocation,
    getCurrentUserMemories,
    deleteMemory
}
