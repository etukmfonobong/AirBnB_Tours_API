const mongoose = require('mongoose')
const userSchema = require('./../schemas/userSchema')//userSchema import

const User = mongoose.model('User', userSchema)//create model User from schema

module.exports = User