const tourSchema = require('./../tourSchema')
const slugify = require('slugify')

//document middleware-this refers to the current document
exports.createSlugBeforeSave = () => {
  return tourSchema.pre('save', function (next) {
    this.slug = slugify(this.name, {lower: true})
    next()
  })
}