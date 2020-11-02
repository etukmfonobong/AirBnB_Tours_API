const mongoose = require('mongoose')
const validator = require('validator')

module.exports = userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Please provide your name']
  },
  email: {
    type: String,
    required: [true, 'Please provide an email address'],
    unique: true,
    lowercase: true,
    validate: [validator.isEmail, 'Please provide a valid email address']
  },
  active: {
    type: Boolean,
    default: true,
    select: false
  },
  photo: {
    type: String,
    default: 'default.jpg'
  },
  role: {
    type: String,
    enum: ['user', 'guide', 'lead-guide', 'admin'],
    default: 'user'
  },
  password: {
    type: String,
    required: [true, 'Please provide a password'],
    minlength: [8, 'Password must be at least 8 characters long'],
    select: false
  },
  passwordConfirm: {
    type: String,
    required: [true, 'Please confirm your password'],
    validate: {
      validator: function (passwordConfirm) {
        return this.password === passwordConfirm
      },
      message: 'password and passwordConfirm must match'
    }
  },
  passwordChangedAt: {
    type: Date
  },
  passwordResetToken: {
    type: String
  },
  passwordResetTokenExpiresAt: {
    type: Date
  }
})

//userSchema Document Middleware
//userSchemaDocumentMiddleware is a simple refactor file to make things cleaner
//document middleware are wrapped in anonymous functions
const userSchemaDocumentMiddleware = require('./schemaMiddleware/userSchemaDocumentMiddleware')
userSchemaDocumentMiddleware.hashPassword()
userSchemaDocumentMiddleware.setPasswordChangedAt()


//userSchema Query Middleware
//userSchemaQueryMiddleware is a simple refactor file to make things cleaner
//query middleware are wrapped in anonymous functions
const userSchemaQueryMiddleware = require('./schemaMiddleware/userSchemaQueryMiddleware')
userSchemaQueryMiddleware.filterOutInactiveUsers()

//instance methods
const userSchemaInstanceMethods = require('./instanceMethods/userSchemaInstanceMethods')
userSchema.methods.verifyPassword = userSchemaInstanceMethods.verifyPassword
userSchema.methods.changedPassword = userSchemaInstanceMethods.changedPassword
userSchema.methods.createPasswordResetToken = userSchemaInstanceMethods.createPasswordResetToken