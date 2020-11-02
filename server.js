//handle uncaught exceptions
process.on('uncaughtException', (err) => {
  console.log(err)
  process.exit(1)
})

const dotenv = require('dotenv')
dotenv.config({path: './config.env'}) //set environment variables from config.env file

const mongoose = require('mongoose')


//connect to database local
if (process.env.NODE_ENV === 'development') {
  mongoose.connect(process.env.DATABASE_LOCAL, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    autoIndex: true,
    useFindAndModify: false,
    useCreateIndex: true
  }).then(() => {
    console.log('DB connection successful')
  })
}

//connect to database atlas
if (process.env.NODE_ENV === 'production') {
  mongoose.connect(process.env.DATABASE_ATLAS, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    autoIndex: true,
    useFindAndModify: false,
    useCreateIndex: true
  }).then(() => {
    console.log('DB connection successful')
  })
}

const app = require('./app')
const port = process.env.PORT || 8000

const server = app.listen(port, () => {
  console.log(`App running on port ${port}`)
})//start listening for requests

//handle unhandled rejections
process.on('unhandledRejection', (err) => {
  console.log(err)
  server.close(() => {
    process.exit(1)
  })
})
