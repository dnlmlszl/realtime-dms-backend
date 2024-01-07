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
  title: {
    type: String,
    minlength: 2,
  },
  firstname: {
    type: String,
    required: true,
    minlength: 3,
  },
  lastname: {
    type: String,
    required: true,
    minlength: 3,
  },
  birthDate: {
    type: Date,
  },
  registrationDate: {
    type: Date,
    default: Date.now,
  },
  lastLogin: {
    type: Date,
    default: Date.now,
  },
  gender: {
    type: String,
    enum: ['male', 'female', 'other'],
    required: true,
  },
  nationality: {
    type: String,
    minlength: 3,
  },
  address: {
    type: String,
    minlength: 3,
  },
  phone: {
    type: String,
    minlength: 11,
  },
  favorites: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Client',
    },
  ],
  profileImage: {
    type: String,
    default: 'https://cdn-icons-png.flaticon.com/512/149/149071.png',
  },
  description: {
    type: String,
    minlength: 3,
  },
  employeeLevel: {
    type: String,
    enum: ['junior', 'regular', 'senior', 'manager', 'director'],
    default: 'junior',
  },
  status: {
    type: String,
    enum: ['active', 'inactive', 'suspended'],
    default: 'active',
  },
  team: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Team',
  },
  role: {
    type: String,
    enum: ['master', 'admin', 'user'],
    default: 'user',
  },
  securityQuestions: [
    {
      question: String,
      answer: String,
    },
  ],
  settings: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'ClientSpecificSettings',
    },
  ],
});

schema.pre('save', function (next) {
  if (!this.profileImage) {
    this.profileImage = 'https://cdn-icons-png.flaticon.com/512/149/149071.png';
  }
  next();
});

module.exports = mongoose.model('User', schema);
