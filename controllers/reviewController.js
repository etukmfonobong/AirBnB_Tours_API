const Review = require('./../models/reviewModel')//tour model import
const controllerFactory = require('./../controllerFactory')


exports.allowNestedRoutes = (req, res, next) => {
  //this is to allow request for the reviews of a single tour
  //from route GET tour/:tourId/reviews
  //if tourId is available
  let filter = {}
  if (req.params["tourId"]) filter = {tour: req.params["tourId"]}
  req.filterForOne = filter
  next()
}

exports.setTourUserIds = (req, res, next) => {
  //allow nested routes
  //from route POST tour/:tourId/reviews
  if (!req.body.tour) req.body.tour = req.params["tourId"]
  if (!req.body.user) req.body.user = req.user._id
  next()
}

//get all reviews
exports.getAllReviews = controllerFactory.getAll(Review)

//create review
exports.createReview = controllerFactory.createOne(Review)

//update review
exports.updateReview = controllerFactory.updateOne(Review, ['review', 'rating'])

//get single review
exports.getReview = controllerFactory.getOne(Review)

//delete single review
exports.deleteReview = controllerFactory.deleteOne(Review)


