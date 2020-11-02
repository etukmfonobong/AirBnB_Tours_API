const userSchema = require('./../userSchema')
const customError = require('./../../utilities/errorBuilder')
const bcrypt = require('bcrypt')

//document middleware-this refers to the current document
exports.hashPassword = () => {
  return userSchema.pre('save', async function (next) {
    if (!this.isModified('password')) {//if password has not been modified skip hashing password
      return next()
    }

    try {
      this.password = await bcrypt.hash(this.password, 12) //try to hash password
      this["passwordConfirm"] = undefined//do not persist passwordConfirm to db

      next()
    } catch (e) {
      next(new customError(e.message))
    }
  })
}

exports.setPasswordChangedAt = () => {
  return userSchema.pre('save', function (next) {
    if (!this.isModified('password') || this.isNew) {
      return next()
    }
    this.passwordChangedAt = Date.now() - 1000
    next()
  })
}