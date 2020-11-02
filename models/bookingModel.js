const mongoose = require('mongoose')
const bookingSchema = require('./../schemas/bookingSchema')//bookingSchema import

const Booking = mongoose.model('Booking', bookingSchema)//create model Booking from schema

module.exports = Booking