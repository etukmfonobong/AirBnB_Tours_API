//set environment variables from config.env file
const path = require('path')
const dotenv = require('dotenv')
dotenv.config({path: path.join(__dirname + '/../config.env')})


//connect to database
const mongoose = require('mongoose')
mongoose.connect(process.env.DATABASE_ATLAS, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  useFindAndModify: false,
  useCreateIndex: true
}).then(() => {
  console.log('DB connection successful')
})

//import Models
const Tour = require('./../models/tourModel')
const User = require('./../models/userModel')
const Review = require('./../models/reviewModel')

//import seeders
const tourSeeder = require('./tours/tourSeeder')
const userSeeder = require('./users/userSeeder')
const reviewSeeder = require('./reviews/reviewSeeder')

//get get seed data
const tours = tourSeeder.setDataTours()
const users = userSeeder.setDataUsers()
const reviews = reviewSeeder.setDataReviews()


//import data into db
const importData = async () => {
  await Tour.create(tours)
  await User.create(users)
  await Review.create(reviews)
}

//delete data from db
const deleteData = async () => {
  await Tour.deleteMany()
  await User.deleteMany()
  await Review.deleteMany()
}

if (process.argv[2] === '--import') {
  importData().then(() => {
    console.log('data successfully seeded')
  }).catch((e) => {
    console.log(e)
  }).finally(() => {
    process.exit()
  })
} else if (process.argv[2] === '--delete') {
  deleteData().then(() => {
    console.log('data successfully deleted')
  }).catch((e) => {
    console.log(e)
  }).finally(() => {
    process.exit()
  })
}