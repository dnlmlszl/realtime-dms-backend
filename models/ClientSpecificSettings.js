const mongoose = require('mongoose');

const schema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  clientId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Client',
    required: true,
  },
  hiddenEntities: [
    {
      entityId: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
      },
      entityType: {
        type: String,
        enum: ['Category', 'Subgroup', 'Process'],
        required: true,
      },
      hidden: {
        type: Boolean,
        default: true,
      },
    },
  ],
});

module.exports = mongoose.model('ClientSpecificSettings', schema);
