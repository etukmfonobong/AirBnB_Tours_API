const customError = require('./utilities/errorBuilder')//error builder middleware
const errorHandler = require('./utilities/errorHandler/errorHandler')//error handler middleware

const rateLimit = require('express-rate-limit')
const helmet = require('helmet')
const mongoSanitize = require('express-mongo-sanitize')
const xss = require('xss-clean')
const hpp = require('hpp')
const cors = require('cors')
const cookieParser = require('cookie-parser')
const compression = require('compression')


const tourRouter = require('./routes/tourRoutes') //tour router import
const userRouter = require('./routes/userRoutes') //user router import
const reviewRouter = require('./routes/reviewRoutes') //review router import
const bookingRouter = require('./routes/bookingRoutes') //booking router import
const bookingController = require('./controllers/bookingController')

const express = require('express')
const path = require('path')
const app = express()

app.enable('trust proxy')

//template engine
app.set('view engine', 'pug')

//global middlewares
//parse cookies
app.use(cookieParser())

//allow cross site resource sharing from specified domains
app.use(cors({
  credentials: true,
  origin: ['http://localhost:8080', 'http://192.168.8.120:8080', 'https://airbnb-tours-etukmfon.herokuapp.com'],
  exposedHeaders: ["set-cookie"],
  optionsSuccessStatus: 200 // some legacy browsers (IE11, various SmartTVs) choke on 204
}))
app.options('*', cors())


//set http security headers
app.use(helmet())

//rate limiter
const limiter = rateLimit({
  max: 1000,//allow 100 request from the same ip
  windowMs: 60 * 60 * 1000,//per hour
  message: 'Too many requests from this IP address, Please try again in an hour'
})
app.use('/api', limiter)

//Stripe webhook - needs to come before json body parser
app.post('/webhook-checkout/create-booking', bookingController.test, express.raw(), bookingController.createBookingFromWebhook)

//body parser
app.use(express.json({limit: '10kb'})) //add body to the request object

//data sanitization against NoSQL query injection
app.use(mongoSanitize())

//data sanitization against XSS attacks
app.use(xss())

//prevent parameter pollution
app.use(hpp({
  whitelist: ['duration', 'ratingsAverage', 'ratingsQuantity', 'difficulty', 'maxGroupSize', 'price']
}))

//compress all text responses
app.use(compression())

//serving static files
// app.use(express.static(`${__dirname}/public`))
app.use(express.static(path.join(__dirname, 'public')))

//routes
app.use('/api/v1/tours', tourRouter) //middleware into tours route
app.use('/api/v1/users', userRouter) //middleware into users route
app.use('/api/v1/reviews', reviewRouter) //middleware into reviews route
app.use('/api/v1/bookings', bookingRouter) //middleware into bookings route

//catch all route handler for routes that do not exist
app.use('*', (req, res, next) => {
  next(new customError(`Can't find ${req.originalUrl} on this server!`, 404))
})

//global error handling middleware
app.use(errorHandler)

module.exports = app