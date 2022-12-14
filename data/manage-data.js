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
let noName =
  (noWiki =
  noBinomial =
  noLocation =
  noShortDesc =
  noImg =
  noLastRecord =
    0);
animals.forEach((animal) => {
  if (!animal.commonName) {
    // console.log('No common name: ', animal.binomialName);
    noName++;
  }
  if (!animal.wikiLink) {
    // console.log('No wiki: ', animal.binomialName);
    noWiki++;
  }
  if (!animal.binomialName) {
    // console.log("No binomial name: ", animal.commonName);
    noBinomial++;
  }
  if (!animal.location) {
    // console.log('No last record: ', animal.binomialName);
    noLocation++;
  }
  if (!animal.lastRecord) {
    // console.log('No wiki: ', animal.binomialName);
    noLastRecord++;
  }
  if (!animal.shortDesc) {
    console.log('No shortDesc: ', animal.binomialName);
    noShortDesc++;
  }
  if (!animal.imageSrc) {
    // console.log('No img: ', animal.binomialName);
    noImg++;
  }
});

// Check duplicate binomialNames
// const lookup = animals.reduce((a, e) => {
//   a[e.binomialName] = ++a[e.binomialName] || 0;
//   return a;
// }, {});
// console.log(animals.filter((e) => lookup[e.binomialName]));

const importData = async () => {
  console.log('noName: ', noName);
  console.log('noWiki: ', noWiki);
  console.log('noBinomial: ', noBinomial);
  console.log('noLocation: ', noLocation);
  console.log('noShortDesc: ', noShortDesc);
  console.log('noImg: ', noImg);
  console.log('noLastRecord: ', noLastRecord);
  console.log('length: ', animals.length);
  try {
    // await Animals.create({ name: 'Rihno' });
    await Animals.insertMany(animals);
    // await Animals.insertMany(animals, { ordered: false });
    console.log('Data added to DB');
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
