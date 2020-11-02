const tourSchema = require('./../tourSchema')
const Review = require('./../../models/reviewModel')

exports.filterOutSecretTours = () => {
  return tourSchema.pre(/^find/, function (next) {
    this.find({secretTour: {$ne: true}})
    next()
  })
}

exports.populateFields = () => {
  return tourSchema.pre(/^find/, function (next) {
    this.populate({
      path: 'guides',
      select: '-__v -passwordChangedAt'
    })
    next()
  })
}


//1 if tour is deleted, also documents refrencing it on other models/collections - on delete cascade
exports.setRemoveChildrenDocuments = () => {
  return tourSchema.pre(/^findOneAndDelete/, async function (next) {
    this.document = await this.findOne()//get current document and pass to post middleware through this
    next()
  })
}

//1 if tour is deleted, also documents refrencing it on other models/collections - on delete cascade
exports.removeChildrenDocument = () => {
  return tourSchema.post(/^findOneAndDelete/, async function () {
    await Review.deleteMany({tour: this.document._id})//delete references to tour on Review model/collection
  })
}

