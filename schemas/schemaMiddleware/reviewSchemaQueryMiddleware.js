const reviewSchema = require('./../reviewSchema')

//on query populate review with user info
exports.populateFields = () => {
  return reviewSchema.pre(/^find/, function (next) {
    this.populate({
      path: 'user',
      select: 'name photo'
    })
    next()
  })
}

//1 calculate ratingsAverage and ratingsQuantity for tour on update and delete
exports.setupCalcAverageRatings = () => {
  return reviewSchema.pre(/^findOneAnd/, async function (next) {
    this.document = await this.findOne()//get current document and pass to post middleware through this
    next()
  })
}

//2 calculate ratingsAverage and ratingsQuantity for tour on update and delete
exports.calcAverageRatings = () => {
  return reviewSchema.post(/^findOneAnd/, async function () {
    await this.document.constructor.calcAverageRatings(this.document.tour)//actually calculate tour ratings
  })
}
