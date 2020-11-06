const express = require('express')
const router = express.Router()
const authController = require('./../controllers/authController')
const bookingController = require('./../controllers/bookingController') //booking controller


router
  .route('/checkout-session/:tourId')
  .get(authController.createBearerToken, authController.protect, bookingController.getCheckoutSession)

module.exports = router