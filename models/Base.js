const mongoose = require('mongoose');

const baseOptions = {
  discriminatorKey: 'entityType',
  collection: 'entities',
};

const Base = mongoose.model('Base', new mongoose.Schema({}, baseOptions));

const CategoryRef = Base.discriminator(
  'Category',
  new mongoose.Schema({
    refId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Category',
    },
  })
);

const SubgroupRef = Base.discriminator(
  'Subgroup',
  new mongoose.Schema({
    refId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Subgroup',
    },
  })
);

const ProcessRef = Base.discriminator(
  'Process',
  new mongoose.Schema({
    refId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Process',
    },
  })
);

module.exports = {
  Base,
  CategoryRef,
  SubgroupRef,
  ProcessRef,
};

module.exports.baseOptions = baseOptions;
