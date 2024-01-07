const mongoose = require('mongoose');

const schema = new mongoose.Schema({
  teamName: {
    type: String,
    required: true,
    unique: true,
    minlength: 3,
  },
  leader: {
    type: mongoose.Schema.ObjectId,
    ref: 'User',
    required: true,
  },
  members: [
    {
      type: mongoose.Schema.ObjectId,
      ref: 'User',
    },
  ],
  clients: [
    {
      type: mongoose.Schema.ObjectId,
      ref: 'Client',
    },
  ],
  subsidiary: {
    type: String,
    minlength: 3,
    required: true,
  },
});

module.exports = mongoose.model('Team', schema);
