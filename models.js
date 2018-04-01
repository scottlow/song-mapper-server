import mongoose from 'mongoose';
import findOrCreate from 'mongoose-findorcreate'

var Schema = mongoose.Schema;

var LocationSchema = Schema({
  name: String,
  gId: String,
  address: String,
  pinLocation: {
    lat: Number,
    long: Number
  }
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

var UserTokenSchema = Schema({
  accessToken: String,
  refreshToken: String,
  grantedAt: Number,
  expiresIn: Number
});

var UserSchema = Schema({
  displayName: String,
  email: String,
  memories: [MemorySchema],
  profileImageURI: String,
  token: UserTokenSchema
});

UserSchema.plugin(findOrCreate);
LocationSchema.plugin(findOrCreate);
SongSchema.plugin(findOrCreate);

var User = mongoose.model('User', UserSchema);
var Memory = mongoose.model('Memory', MemorySchema);
var Song = mongoose.model('Song', SongSchema);
var Location = mongoose.model('Location', LocationSchema);
var UserToken = mongoose.model('Token', UserTokenSchema);

export { User, Memory, Song, Location }