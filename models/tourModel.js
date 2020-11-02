const mongoose = require('mongoose')
const tourSchema = require('./../schemas/tourSchema')//tourSchema import

const Tour = mongoose.model('Tour', tourSchema)//create model Tour from schema

module.exports = Tour