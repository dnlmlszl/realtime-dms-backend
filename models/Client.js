const mongoose = require('mongoose');

const schema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  taxId: {
    type: String,
  },
  description: {
    type: String,
  },
  processGroups: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Category',
    },
  ],
  isFavorite: {
    type: Boolean,
    default: false,
  },
});

module.exports = mongoose.model('Client', schema);
