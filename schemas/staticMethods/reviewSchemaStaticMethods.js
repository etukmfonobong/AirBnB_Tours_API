const mongoose = require('mongoose')
const tourSchema = require('./../tourSchema')

exports.calcAverageRatings = async function (tourId) {

  //calculate ratingsAverage and ratingsQuantity for tour
  const stats = await this.aggregate([
    {
      $match: {tour: tourId}
    },
    {
      $group: {
        _id: 'tour',
        numRatings: {$sum: 1},
        avgRating: {$avg: '$rating'}
      }
    }
  ])

  //if stats exists - protection against situation were there are no reviews for a tour
  if (stats.length > 0) {
    //save ratingsAverage and ratingsQuantity to tour
    await mongoose.model('Tour', tourSchema).findByIdAndUpdate(tourId, {
      ratingsAverage: stats[0].avgRating,
      ratingsQuantity: stats[0].numRatings
    })
  } else {
    //reset ratingsAverage and ratingsQuantity on tour
    await mongoose.model('Tour', tourSchema).findByIdAndUpdate(tourId, {
      ratingsAverage: 0,
      ratingsQuantity: 0
    })
  }

}