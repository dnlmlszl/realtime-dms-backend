const mongoose = require('mongoose');

const schema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  processes: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Process',
    },
  ],
  hidden: {
    type: Boolean,
    default: false,
  },
});

module.exports = mongoose.model('Subgroup', schema);
