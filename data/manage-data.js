require('dotenv').config({ path: `${__dirname}/../config.env` });

const fs = require('fs');
const mongoose = require('mongoose');
const Animals = require('../models/animalModel');

const DB = process.env.DATABASE.replace('<PASSWORD>', process.env.DB_PASS);

mongoose
  .connect(DB, {
    useNewUrlParser: true,
  })
  .then(() => console.log('DB Connected'));

// Get JSON file
const animals = JSON.parse(fs.readFileSync(`${__dirname}/animalData.json`));

// Import data to DB
// let noName =
//   (noWiki =
//   noBionominal =
//   noLocation =
//   noShortDesc =
//   noImg =
//   noLastRecord =
//     0);
// animals.forEach((animal) => {
//   if (!animal.commonName) {
//     // console.log(animal.bionomialName);
//     noName++;
//   }
//   if (!animal.wikiLink) noWiki++;
//   if (!animal.bionomialName) noBionominal++;
//   if (!animal.lastRecord) {
//     // console.log(animal.bionomialName);
//     noLocation++;
//   }
//   if (!animal.wikiLink) noLastRecord++;
//   if (!animal.shortDesc) {
//     // console.log('No short desc: ', animal.bionomialName);
//     noShortDesc++;
//   }
//   if (!animal.imageSrc) noImg++;
// });

const importData = async () => {
  // console.log('noName: ', noName);
  // console.log('noWiki: ', noWiki);
  // console.log('noBionominal: ', noBionominal);
  // console.log('noLocation: ', noLocation);
  // console.log('noShortDesc: ', noShortDesc);
  // console.log('noImg: ', noImg);
  // console.log('noLastRecord: ', noLastRecord);
  try {
    // await Animals.create({ name: 'Rihno' });
    await Animals.insertMany(animals, { ordered: false });
    console.log('Data added to DB');
    console.log('length: ', animals.length);
  } catch (err) {
    console.log('ERROR inserting data: ', err);
  }
  process.exit();
};

// Delete all data drom DB
const deleteData = async () => {
  try {
    await Animals.deleteMany();
    console.log('Data deleted from DB');
  } catch (err) {
    console.log(err);
  }
  process.exit();
};

if (process.argv[2] === '--import') importData();
if (process.argv[2] === '--delete') deleteData();
//terminal: node manage-data.js --import
console.log(process.argv);
