const mongoose = require('mongoose');

const animalSchema = new mongoose.Schema({
  name: {
    type: String,
    trim: true,
    unique: [true, 'Animal name needs to be unique'],
    required: [false, 'Animal name is required.'],
    minLength: [2, 'Minimum name length is 2 characters.'],
    maxLength: [300, 'Maximum name length is 300 characters.'],
  },
});

const Animal = mongoose.model('Animal', animalSchema);
module.exports = Animal;
