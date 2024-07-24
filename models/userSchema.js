const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const bcrypt = require('bcrypt');

const userSchema = new Schema({
  email: {
    type: String,
    unique: true,
    required: [true, 'Provide an email'],
    lowercase: true,
    trim: true,
  },
  password: {
    type: String,
    required: [true, 'Provide a password'],
    minlength: 6,
  },
  firstName: {
    type: String,
    required: [true, 'Provide a first name'],
    trim: true,
  },
  lastName: {
    type: String,
    required: [true, 'Provide a last name'],
    trim: true,
  },
  birthDate: {
    type: Date,
    required: [true, 'Provide a birth date'],
  },
  roles: {
    type: [String],
    default: ['user']
  },
  resetPasswordToken: {
    type: String,
    default: null
  },
  isActive: {
    type: Boolean,
    default: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// Method to deactivate the user
userSchema.methods.deactivateUser = async function () {
  this.isActive = false;
  await this.save();
};

// Middleware to hash password before saving
userSchema.pre('save', async function (next) {
  if (this.isModified('password')) {
    try {
      const salt = await bcrypt.genSalt(10);
      this.password = await bcrypt.hash(this.password, salt);
    } catch (error) {
      return next(error);
    }
  }
  this.updatedAt = Date.now();
  next();
});

const User = mongoose.model('User', userSchema);

module.exports = User;
