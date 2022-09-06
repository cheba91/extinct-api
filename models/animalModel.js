const mongoose = require('mongoose');

const animalSchema = new mongoose.Schema({
  binomialName: {
    type: String,
    required: [true, 'Animal binomial name is required.'],
    maxLength: [300, 'Maximum binomial name length is 300 characters.'],
  },
  commonName: {
    type: String,
    maxLength: [300, 'Maximum name length is 300 characters.'],
  },
  location: {
    type: String,
    maxLength: [500, 'Maximum location length is 500 characters.'],
  },
  wikiLink: {
    type: String,
    maxLength: [500, 'Maximum wikiLink is 500 characters.'],
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
});
// Remove _id & __v
animalSchema.post('aggregate', function (docs, next) {
  docs.forEach((doc) => {
    console.log(' v: ', doc.__v);
    delete doc.__v;
    delete doc._id;
  });

  next();
});
const Animal = mongoose.model('Animal', animalSchema);
module.exports = Animal;
