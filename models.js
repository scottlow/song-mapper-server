import mongoose from 'mongoose';
import findOrCreate from 'mongoose-findorcreate'

var Schema = mongoose.Schema;

var LocationSchema = Schema({
  name: String,
  gId: String,
  address: String,
  lat: String,
  long: String
});

var SongSchema = Schema({
  title: String,
  artist: String,
  spotifyURI: String,
  albumArtURI: String
});

var MemorySchema = Schema({
  song: SongSchema,
  location: LocationSchema
});

var UserSchema = Schema({
    displayName: String,
    email: String,
    memories: [MemorySchema],
    profileImageURI: String,
    accessToken: String,
    refreshToken: String
  });

  UserSchema.plugin(findOrCreate);
  LocationSchema.plugin(findOrCreate);
  SongSchema.plugin(findOrCreate);

  var User = mongoose.model('User', UserSchema);
  var Memory = mongoose.model('Memory', MemorySchema);
  var Song = mongoose.model('Song', SongSchema);
  var Location = mongoose.model('Location', LocationSchema);

  export { User, Memory, Song, Location }