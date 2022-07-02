const mongoose = require('mongoose');
const Tour = require('./tourModel');

const reviewSchema = new mongoose.Schema(
  {
    review: {
      type: String,
      required: [true, 'Review text is required.'],
      minLength: [2, 'Minimum review length is 2 characters.'],
      maxLength: [1000, 'Maximum review length is 1000 characters.'],
    },
    rating: {
      type: Number,
      required: [true, 'Rating is required.'],
      min: [1, 'Rating must be between 1 and 5.'],
      max: [5, 'Rating must be between 1 and 5.'],
    },
    createdAt: {
      type: Date,
      default: Date.now(),
    },
    user: {
      type: mongoose.Schema.ObjectId,
      ref: 'User',
      required: [true, 'Review must belong to a user'],
    },
    tour: {
      type: mongoose.Schema.ObjectId,
      ref: 'Tour',
      required: [true, 'Review must belong to a tour'],
    },
  },
  {
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// QUERY MIDDLEWARE //

// allow only one review per tour by user (might not work immediately)
reviewSchema.index({ tour: 1, user: 1 }, { unique: true });

//populate user and tour
reviewSchema.pre(/^find/, function (next) {
  this.populate({
    path: 'user',
    select: 'name photo',
  });
  next();
});

//updating reviews quantity and average
reviewSchema.statics.calcAverageRatings = async function (tourId) {
  const stats = await this.aggregate([
    {
      $match: { tour: tourId },
    },
    {
      $group: {
        _id: '$tour',
        nRating: { $sum: 1 },
        avgRating: { $avg: '$rating' },
      },
    },
  ]);
  if (stats.length > 0) {
    await Tour.findByIdAndUpdate(tourId, {
      ratingsQty: stats[0].nRating,
      ratingsAverage: stats[0].avgRating,
    });
  } else {
    //default values, if no reviews yet
    await Tour.findByIdAndUpdate(tourId, {
      ratingsQty: 0,
      ratingsAverage: 2.5,
    });
  }
};
reviewSchema.post('save', function () {
  //this keyword points to current review
  this.constructor.calcAverageRatings(this.tour);
});
reviewSchema.post(/^findOneAnd/, async (docs) => {
  if (docs) await docs.constructor.calcAverageRatings(docs.tour);
});

const Review = mongoose.model('Review', reviewSchema);
module.exports = Review;
