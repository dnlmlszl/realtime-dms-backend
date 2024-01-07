const mongoose = require('mongoose');

const schema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  hidden: {
    type: Boolean,
    default: false,
  },
});

module.exports = mongoose.model('Process', schema);
