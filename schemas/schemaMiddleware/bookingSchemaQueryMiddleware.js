const reviewSchema = require('./../reviewSchema')

//on query populate review with user info
exports.populateFields = () => {
  return reviewSchema.pre(/^find/, function (next) {
    this.populate({
      path: 'user'
    }).populate({
      path: 'tour',
      select: 'name'
    })
    next()
  })
}

