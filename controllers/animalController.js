const Animals = require('../models/animalModel');
const AppError = require('../utils/appError');
const catchAsync = require('../utils/catchAsync');

exports.getOne = (() =>
  catchAsync(async (req, res, next) => {
    return res.status(200).json({
      status: 'HERE!!!',
    });
    const doc = await Animals.aggregate([{ $sample: { size: 1 } }]);
    if (!doc) return next(new AppError(`No animal was found.`, 404));
    res.status(200).json({
      status: 'success',
      data: doc,
    });
  }))();

exports.getMultiple = (() =>
  catchAsync(async (req, res, next) => {
    let number = parseInt(req.params.nr);
    if (!number) return next(new AppError('Invalid number passed.', 400));
    if (number > process.env.TOTAL_ANIMALS) number = process.env.TOTAL_ANIMALS;
    if (number < 1) number = 1;
    const doc = await Animals.aggregate([{ $sample: { size: number } }]);
    res.status(200).json({
      status: 'success',
      data: doc,
    });
  }))();
