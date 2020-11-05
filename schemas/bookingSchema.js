const mongoose = require('mongoose')
const userSchema = require('./userSchema')
const tourSchema = require('./tourSchema')

module.exports = bookingSchema = new mongoose.Schema({
  paid: {
    type: Boolean,
    default: true
  },
  price: {
    type: Number,
    required: [true, 'Booking must have a price']
  },
  createdAt: {
    type: Date,
    default: Date.now()
  },
  tour: {
    type: mongoose.Schema.ObjectId,
    ref: mongoose.model('Tour', tourSchema),
    required: [true, 'Booking must belong to a tour']
  },
  user: {
    type: mongoose.Schema.ObjectId,
    ref: mongoose.model('User', userSchema),
    required: [true, 'Booking must belong to a user']
  }

}, {
  toJSON: {virtuals: true},
  toObject: {virtuals: true}
})
//indexes
bookingSchema.index({tour: 1, user: 1}, {unique: true, background: true, dropDups: true})

//bookingSchema Virtual Properties
//virtual properties: are fields that can be derived from other fields
// bookingSchema.virtual('durationWeeks').get(function () {
//   return this.duration / 7
// })

//bookingSchema static methods
// const reviewSchemaStaticMethods = require('./../schemas/staticMethods/reviewSchemaStaticMethods')
// bookingSchema.statics.calcAverageRatings = reviewSchemaStaticMethods.calcAverageRatings

//bookingSchema Document Middleware
//reviewSchemaDocumentMiddleware is a simple refactor file to make things cleaner
//document middleware are wrapped in anonymous functions
// const reviewSchemaDocumentMiddleware = require('./schemaMiddleware/reviewSchemaDocumentMiddleware')
// reviewSchemaDocumentMiddleware.calcAverageRatings()

//bookingSchema Query Middleware
//bookingSchemaQueryMiddleware is a simple refactor file to make things cleaner
//query middleware are wrapped in anonymous functions
const bookingSchemaQueryMiddleware = require('./schemaMiddleware/bookingSchemaQueryMiddleware')
bookingSchemaQueryMiddleware.populateFields()

