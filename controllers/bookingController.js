const Tour = require('./../models/tourModel')//tour model import
// const controllerFactory = require('./../controllerFactory')

const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY)

exports.getCheckoutSesssion = async (req, res, next) => {
  try {
    //get tour to be booked from db
    const tour = await Tour.findById(req.params["tourId"])

    console.log(req)
    //create a stripe checkout session
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      customer_email: req.user.email,
      success_url: `${req.protocol}://${req.get('origin')}/home`,
      cancel_url: `${req.protocol}://${req.get('origin')}/tour/${tour._id}`,
      client_reference_id: req.params['tourId'],
      line_items: [
        {
          name: `${tour.name} Tour`,
          description: tour.summary,
          images: [`https://www.natours.dev/img/tours/${tour.imageCover}`],
          amount: tour.price * 100,//multipy by 100 to convert to kobo
          currency: 'ngn',
          quantity: 1

        }
      ]
    })
    console.log(req)
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




