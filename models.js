import mongoose from 'mongoose';
import findOrCreate from 'mongoose-findorcreate'

var Schema = mongoose.Schema;

var LocationSchema = Schema({
  name: String,
  lat: String,
  long: String
});

var TrackSchema = Schema({
  title: String,
  artist: String,
  spotifyURI: String,
  genre: String,
  albumArtURI: String,
  duration: Number
});

var MemorySchema = Schema({
  track: TrackSchema,
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

  var User = mongoose.model('User', UserSchema);
  var Memory = mongoose.model('Memory', MemorySchema);

  export { User }