const bookingSchema = require('./../bookingSchema')

//on query populate booking with user and tour info
exports.populateFields = () => {
  return bookingSchema.pre(/^find/, function (next) {
    this.populate({
      path: 'user'
    }).populate({
      path: 'tour',
    })
    next()
  })
}

