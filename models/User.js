const mongoose = require('mongoose');

const schema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    unique: true,
    minlength: 3,
  },
  passwordHash: {
    type: String,
    required: true,
    minlength: 6,
  },
  favorites: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Client',
    },
  ],
  profileImage: {
    type: String,
    minlength: 6,
  },
  description: {
    type: String,
    minlength: 3,
  },
  role: {
    type: String,
    enum: ['master', 'admin', 'user'],
  },
  settings: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'ClientSpecificSettings',
    },
  ],
});

module.exports = mongoose.model('User', schema);
