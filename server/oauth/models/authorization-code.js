const mongoose = require('mongoose');

const authorizationCodeSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  expireAt: Date,
  application: { type: mongoose.Schema.Types.ObjectId, ref: 'Application' },
  code: String,
});

module.exports = mongoose.model('AuthorizationCode', authorizationCodeSchema);
