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
const animals = JSON.parse(fs.readFileSync(`${__dirname}/animalsFile.json`));
// Import data to DB
const importData = async () => {
  try {
    await Animals.create({ name: 'Cow' });
    console.log('Data added to DB');
  } catch (err) {
    console.log(err);
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
