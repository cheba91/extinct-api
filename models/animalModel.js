const mongoose = require('mongoose');

const animalSchema = new mongoose.Schema({
  name: {
    type: String,
    unique: [true, 'Animal name needs to be unique'],
    required: [true, 'Animal name is required.'],
    minLength: [2, 'Minimum name length is 2 characters.'],
    maxLength: [300, 'Maximum name length is 300 characters.'],
  },
  bionomialName: {
    type: String,
    unique: [true, 'Animal bionomial name needs to be unique'],
    required: [true, 'Animal bionomial name is required.'],
    minLength: [2, 'Minimum bionomial name length is 2 characters.'],
    maxLength: [300, 'Maximum bionomial name length is 300 characters.'],
  },
  location: {
    type: String,
    minLength: [2, 'Minimum location length is 2 characters.'],
    maxLength: [500, 'Maximum location length is 500 characters.'],
  },
  lastRecord: {
    type: String,
    minLength: [2, 'Minimum last record length is 2 characters.'],
    maxLength: [300, 'Maximum last record length is 300 characters.'],
  },
  shortDesc: {
    type: String,
    minLength: [2, 'Minimum name length is 2 characters.'],
    maxLength: [10000, 'Maximum name length is 10000 characters.'],
  },
  imageSrc: {
    type: String,
    minLength: [20, 'Minimum image source length is 20 characters.'],
    maxLength: [500, 'Maximum image source length is 500 characters.'],
  },
});

const Animal = mongoose.model('Animal', animalSchema);
module.exports = Animal;
