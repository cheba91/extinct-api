const mongoose = require('mongoose');

const animalSchema = new mongoose.Schema({
  commonName: {
    type: String,
    maxLength: [300, 'Maximum name length is 300 characters.'],
  },
  bionomialName: {
    type: String,
    unique: [true, 'Animal bionomial name needs to be unique'],
    required: [true, 'Animal bionomial name is required.'],
    maxLength: [300, 'Maximum bionomial name length is 300 characters.'],
  },
  location: {
    type: String,
    maxLength: [500, 'Maximum location length is 500 characters.'],
  },
  lastRecord: {
    type: String,
    maxLength: [300, 'Maximum last record length is 300 characters.'],
  },
  imageSrc: {
    type: String,
    maxLength: [500, 'Maximum image source length is 500 characters.'],
  },
  shortDesc: {
    type: String,
    maxLength: [10000, 'Maximum name length is 10000 characters.'],
  },
  // cause: {
  //   type: String,
  //   minLength: [2, 'Minimum image source length is 2 characters.'],
  //   maxLength: [300, 'Maximum image source length is 300 characters.'],
  // },
});

const Animal = mongoose.model('Animal', animalSchema);
module.exports = Animal;
