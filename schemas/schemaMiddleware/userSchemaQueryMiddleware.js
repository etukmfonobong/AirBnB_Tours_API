const userSchema = require('./../userSchema')

exports.filterOutInactiveUsers = () => {
  return userSchema.pre(/^find/, function (next) {
    this.find({active: true})
    next()
  })
}