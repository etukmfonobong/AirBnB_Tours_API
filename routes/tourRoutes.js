const express = require('express')
const router = express.Router()
const authController = require('./../controllers/authController')
const tourController = require('./../controllers/tourController') //tour controller

const reviewRouter = require('./reviewRoutes')
//nested route
router.use('/:tourId/reviews', reviewRouter)

router
  .route('/get-tours-stats')
  .get(tourController.getToursStats)

router
  .route('/get-monthly-plan/:year')
  .get(tourController.getMonthlyPlan)

router
  .route('/tours-within/:distance/center/:latlng/unit/:unit')
  .get(authController.protect, tourController.getToursWithin)

router
  .route('/distances/:latlng/unit/:unit')
  .get(authController.protect, tourController.getDistances)

router
  .route('/')
  .get(tourController.getAllTours)
  .post(authController.protect, authController.restrictTo('admin', 'lead-guide'), tourController.createTour)

router
  .route('/:id')
  .get(tourController.getTour)
  .patch(authController.protect, authController.restrictTo('admin', 'lead-guide'), tourController.updateTour)
  .delete(
    authController.protect,
    authController.restrictTo('admin', 'lead-guide'),
    tourController.deleteTour)

module.exports = router