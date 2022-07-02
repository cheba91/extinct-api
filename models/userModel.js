const crypto = require('crypto');
const mongoose = require('mongoose');
const validator = require('validator');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Name is required.'],
    minlength: [2, 'Name must be at least 2 characters long.'],
    maxlength: [32, 'Name must be less than 32 characters long.'],
  },
  email: {
    type: String,
    required: [true, 'Please provide your email'],
    unique: [true, 'This email is already in use'],
    lowercase: true,
    validate: [validator.isEmail, 'Please provide a valid email.'],
  },
  photo: {
    type: String,
    default: 'default.jpg',
  },
  role: {
    type: String,
    enum: ['user', 'guide', 'lead-guide', 'admin'],
    default: 'user',
  },
  password: {
    type: String,
    select: false,
    required: [true, 'Please provide a password'],
    minlength: [8, 'Password must be at least 2 characters long.'],
    maxlength: [100, 'Password must be less than 32 characters long.'],
  },
  passwordConfirm: {
    type: String,
    required: [true, 'Plase confirm your password'],
    validate: {
      validator: function (el) {
        return el === this.password;
      },
      message: 'Passwords are not the same',
    },
  },
  passChangedAt: {
    type: Date,
  },
  passwordResetToken: {
    type: String,
  },
  passwordResetExpires: {
    type: Date,
  },
  active: {
    type: Boolean,
    default: true,
    select: false,
  },
});
// QUERY MIDDLEWARE
userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 12);
  this.passwordConfirm = undefined;
  next();
});

// Set passwordChangedAt when pass is reseted
userSchema.pre('save', function (next) {
  if (!this.isModified('password') || this.isNew) return next();
  this.passChangedAt = Date.now() - 1000; //1 sec in past
  next();
});

// Only allow to find users who are active
userSchema.pre(/^find/, function (next) {
  this.find({ active: { $ne: false } });
  next();
});

// METHODS
// check if password is correct
userSchema.methods.correctPassword = async function (candidatePass, userPass) {
  return await bcrypt.compare(candidatePass, userPass);
};

userSchema.methods.changedPassword = function (JWTTimestamp) {
  if (this.passChangedAt) {
    // Needs to be changed in different format
    const changedTimestamp = parseInt(this.passChangedAt.getTime() / 1000, 10);
    return JWTTimestamp < changedTimestamp;
  }
  return false;
};
// create hash
userSchema.methods.createHash = function (token) {
  return crypto.createHash('sha256').update(token).digest('hex');
};
// creating password reset token
userSchema.methods.createPasswordResetToken = function () {
  const resetToken = crypto.randomBytes(32).toString('hex');
  this.passwordResetToken = this.createHash(resetToken);
  this.passwordResetExpires = Date.now() + 10 * 60 * 1000;
  console.log({ resetToken }, this.passwordResetToken);
  return resetToken;
};

const User = mongoose.model('User', userSchema);

module.exports = User;
