const mongoose = require('mongoose');

const schema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  subgroups: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Subgroup',
    },
  ],
  hidden: {
    type: Boolean,
    default: false,
  },
});

module.exports = mongoose.model('Category', schema);
