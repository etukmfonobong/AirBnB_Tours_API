const express = require('express')
// const router = express.Router()
const router = express.Router({mergeParams: true})
const authController = require('./../controllers/authController')
const bookingController = require('./../controllers/bookingController') //booking controller


router
  .route('/')
  .get(authController.createBearerToken, authController.protect, bookingController.allowNestedRoutes, bookingController.getAllBookings)

router
  .route('/checkout-session/:tourId')
  .get(authController.createBearerToken, authController.protect, bookingController.getCheckoutSession)

module.exports = router