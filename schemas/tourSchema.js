const mongoose = require('mongoose')

// const slugify = require('slugify')
module.exports = tourSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'A tour must have a name'],
    unique: true,
    trim: true,
    maxlength: [40, 'The tour name must not exceed 40 characters'],
    minlength: [10, 'The tour name must be at least 10 characters long']
  },
  slug: {
    type: String
  },
  duration: {
    type: Number,
    required: [true, 'A tour must have a duration']
  },
  ratingsAverage: {
    type: Number,
    default: 4.5,
    max: [5, 'Rating must not exceed 5.0'],
    min: [1, 'Rating cannot be below 1.0'],
    set: value => Math.round(value * 10) / 10
  },
  ratingsQuantity: {
    type: Number,
    default: 0
  },
  maxGroupSize: {
    type: Number,
    required: [true, 'A tour must have a max group size']
  },
  difficulty: {
    type: String,
    required: [true, 'A tour must have a difficulty'],
    enum: {
      values: ['easy', 'medium', 'difficult'],
      message: 'Difficulty must be either: easy, medium or difficult'
    }
  },
  price: {
    type: Number,
    required: [true, 'A tour must have price']
  },
  priceDiscount: {
    type: Number,
    validate: {
      validator: function (priceDiscount) {
        return priceDiscount < this["price"]
      },
      message: 'price discount cannot be more than the price'
    }
  },
  summary: {
    type: String,
    trim: true,
    required: [true, 'A tour must have a summary']
  },
  description: {
    type: String,
    trim: true
  },
  imageCover: {
    type: String,
    required: [true, 'A tour must have a cover image']
  },
  images: {
    type: [String]
  },
  createdAt: {
    type: Date,
    default: Date.now()
  },
  startDates: {
    type: [Date]
  },
  secretTour: {
    type: Boolean,
    default: false
  },
  startLocation: {
    type: {
      type: String,
      default: 'Point',
      enum: ['Point']
    },
    coordinates: [Number],
    address: String,
    description: String
  },
  locations: [
    {
      type: {
        type: String,
        default: 'Point',
        enum: ['Point']

      },
      coordinates: [Number],
      address: String,
      description: String
    }
  ],
  guides: [
    {
      type: mongoose.Schema.ObjectId,
      ref: 'User'
    }
  ]
}, {
  toJSON: {virtuals: true},
  toObject: {virtuals: true}
})

//indexes
tourSchema.index({price: 1})
tourSchema.index({startLocation: '2dsphere'});

//tourSchema Virtual Properties
//virtual properties: are fields that can be derived from other fields
tourSchema.virtual('durationWeeks').get(function () {
  return this.duration / 7
})

//virtual populate for parent refrencing
//get tour's reviews
tourSchema.virtual('reviews', {
  ref: 'Review',
  foreignField: 'tour',
  localField: '_id'
})

//tourSchema Document Middleware
//tourSchemaDocumentMiddleware is a simple refactor file to make things cleaner
//document middleware are wrapped in anonymous functions
const tourSchemaDocumentMiddleware = require('./schemaMiddleware/tourSchemaDocumentMiddleware')
tourSchemaDocumentMiddleware.createSlugBeforeSave()

//tourSchema Query Middleware
//tourSchemaQueryMiddleware is a simple refactor file to make things cleaner
//query middleware are wrapped in anonymous functions
const tourSchemaQueryMiddleware = require('./schemaMiddleware/tourSchemaQueryMiddleware')
tourSchemaQueryMiddleware.filterOutSecretTours()
tourSchemaQueryMiddleware.populateFields()
tourSchemaQueryMiddleware.setRemoveChildrenDocuments()//on delete cascade
tourSchemaQueryMiddleware.removeChildrenDocument()//on delete cascade

