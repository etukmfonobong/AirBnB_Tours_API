const reviewSchema = require('./../reviewSchema')

//calculate ratingsAverage and ratingsQuantity for tour on save and create
exports.calcAverageRatings = () => {
  return reviewSchema.post('save', async function () {
    await this.constructor.calcAverageRatings(this.tour)
  })
}
