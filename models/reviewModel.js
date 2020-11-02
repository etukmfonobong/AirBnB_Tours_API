const mongoose = require('mongoose')
const reviewSchema = require('./../schemas/reviewSchema')//reviewSchema import

const Review = mongoose.model('Review', reviewSchema)//create model Review from schema

module.exports = Review