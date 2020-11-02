const mongoose = require('mongoose')
const userSchema = require('./userSchema')
const tourSchema = require('./tourSchema')

// const slugify = require('slugify')
module.exports = reviewSchema = new mongoose.Schema({
  review: {
    type: String,
    required: [true, 'Review cannot be empty'],
    trim: true
  },
  rating: {
    type: Number,
    max: [5, 'Rating must not exceed 5.0'],
    min: [1, 'Rating cannot be below 1.0'],
    required: [true, 'Review must have a rating']
  },
  createdAt: {
    type: Date,
    default: Date.now()
  },
  tour: {
    type: mongoose.Schema.ObjectId,
    ref: mongoose.model('Tour', tourSchema),
    required: [true, 'Review must belong to a tour']
  },
  user: {
    type: mongoose.Schema.ObjectId,
    ref: mongoose.model('User', userSchema),
    required: [true, 'Review must belong to a user']
  }

}, {
  toJSON: {virtuals: true},
  toObject: {virtuals: true}
})
//indexes
reviewSchema.index({tour: 1, user: 1}, {unique: true, background: true, dropDups: true})

//reviewSchema Virtual Properties
//virtual properties: are fields that can be derived from other fields
// reviewSchema.virtual('durationWeeks').get(function () {
//   return this.duration / 7
// })

//reviewSchema static methods
const reviewSchemaStaticMethods = require('./../schemas/staticMethods/reviewSchemaStaticMethods')
reviewSchema.statics.calcAverageRatings = reviewSchemaStaticMethods.calcAverageRatings

//reviewSchema Document Middleware
//reviewSchemaDocumentMiddleware is a simple refactor file to make things cleaner
//document middleware are wrapped in anonymous functions
const reviewSchemaDocumentMiddleware = require('./schemaMiddleware/reviewSchemaDocumentMiddleware')
reviewSchemaDocumentMiddleware.calcAverageRatings()

//reviewSchema Query Middleware
//reviewSchemaQueryMiddleware is a simple refactor file to make things cleaner
//query middleware are wrapped in anonymous functions
const reviewSchemaQueryMiddleware = require('./schemaMiddleware/reviewSchemaQueryMiddleware')
reviewSchemaQueryMiddleware.populateFields()
reviewSchemaQueryMiddleware.setupCalcAverageRatings()
reviewSchemaQueryMiddleware.calcAverageRatings()

