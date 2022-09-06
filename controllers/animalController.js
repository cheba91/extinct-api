const Animals = require('../models/animalModel');
const AppError = require('../utils/appError');
const catchAsync = require('../utils/catchAsync');

exports.getOne = (() =>
  catchAsync(async (req, res, next) => {
    const query = [
      { $match: { imageSrc: { $ne: 'false' } } },
      { $sample: { size: 1 } },
    ];
    const { imageRequired } = req.query;
    imageRequired === 'false' && query.shift();
    const doc = await Animals.aggregate(query);
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
    if (number > process.env.TOTAL_ANIMALS)
      number = parseInt(process.env.TOTAL_ANIMALS);
    if (number < 1) number = 1;
    const doc = await Animals.aggregate([{ $sample: { size: number } }]);
    if (!doc) return next(new AppError('No animals found.', 404));

    res.status(200).json({
      status: 'success',
      results: doc.length,
      data: doc,
    });
  }))();
