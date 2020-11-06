const Tour = require('./../models/tourModel')//tour model import
const Booking = require('./../models/bookingModel')//booking model import
const User = require('./../models/userModel')
const controllerFactory = require("../controllerFactory");
//user model import
// const controllerFactory = require('./../controllerFactory')

const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY)

exports.getCheckoutSession = async (req, res, next) => {
  try {
    //get tour to be booked from db
    const tour = await Tour.findById(req.params["tourId"])

    //create a stripe checkout session
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      customer_email: req.user.email,
      success_url: `${req.get('origin')}/home`,
      cancel_url: `${req.get('origin')}/tour/${tour._id}`,
      client_reference_id: req.params['tourId'],
      line_items: [
        {
          name: `${tour.name} Tour`,
          description: tour.summary,
          images: [`${req.protocol}://${req.get('host')}/img/tours/${tour.imageCover}`],
          amount: tour.price * 100,//multiply by 100 to convert to kobo
          currency: 'ngn',
          quantity: 1

        }
      ]
    })

    //send session as response
    await res.status(200).json({
      status: 'success',
      session
    })
  } catch (e) {
    //create an error message if an error occurs
    return next(e)
  }
}

const createBooking = async (session) => {
  const tour = session.client_reference_id
  const user = (await User.findOne({email: session.customer_email})).id
  const price = session.amount_total / 100

  await Booking.create({tour, user, price})
}

exports.createBookingFromWebhook = async (req, res, next) => {
  console.log('got to hook function')
  try {
    //get webhook signature
    const signature = req.headers['stripe-signature']
    //create an event
    const event = stripe.webhooks.constructEvent(req.body, signature, process.env.STRIPE_WEBHOOK_SECRET)
    if (event.type === 'checkout.session.completed') {
      await createBooking(event.data.object)
    }
    //if everything is ok send response to stripe
    await res.status(200).json({received: true})

  } catch (e) {
    //if (error) send e.message back to stripe
    return await res.status(400).send(`webhook error ${e.message}`)
  }
}

exports.allowNestedRoutes = (req, res, next) => {
  //this is to allow request for the reviews of a single tour
  //from route GET tour/:tourId/reviews
  //if tourId is available
  let filter = {}
  if (req.params["userId"]) filter = {user: req.params["userId"]}
  req.filterForOne = filter
  next()
}

//get all bookings
exports.getAllBookings = controllerFactory.getAll(Booking)


