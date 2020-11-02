const express = require('express')
const router = express.Router({mergeParams: true})
const authController = require('./../controllers/authController')
const reviewController = require('./../controllers/reviewController') //review controller


router
  .route('/')
  .get(authController.protect, reviewController.allowNestedRoutes, reviewController.getAllReviews)
  .post(
    authController.protect,
    authController.restrictTo('user'),
    reviewController.setTourUserIds,
    reviewController.createReview)

router
  .route('/:id')
  .get(authController.protect, reviewController.getReview)
  .patch(
    authController.protect,
    authController.restrictTo('user'),
    reviewController.updateReview)
  .delete(
    authController.protect,
    authController.restrictTo('user'),
    reviewController.deleteReview)

module.exports = router