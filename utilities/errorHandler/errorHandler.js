const helper = require('./errorHandlerMethods')

const sendDevelopmentError = (err, res) => {
  res.status(err.statusCode).json({
    status: err.status,
    name: err.name,
    message: err.message,
    error: err,
    stack_trace: err.stack
  })
}

const sendProductionError = (err, res) => {
  //operational error :trusted :send to client
  if (err.isOperational) {
    res.status(err.statusCode).json({
      status: err.status,
      message: err.message
    })
  } else {
    //programming error or other unknown error :not trusted :don't send to client
    //log error to console
    console.error('FATAL ERROR:', err)
    //send generic message
    res.status(500).json({
      status: 'error',
      message: 'something went very wrong!'
    })
  }

}

//Actual error handler function
const errorHandler = (err, req, res, next) => {
  err.statusCode = err.statusCode || 500
  err.status = err.status || 'error'

  if (process.env.NODE_ENV === 'development') {
    sendDevelopmentError(err, res)

  } else if (process.env.NODE_ENV === 'production') {
    let error = {...err}
    //cast error
    if (err.name === 'CastError') {
      error = helper.handleCastErrorDB(err)
    }
    //duplicate fields error
    if (err.code === 11000) {
      error = helper.handleDuplicateFieldsDB(err)
    }
    //validation error
    if (err.name === 'ValidationError') {
      error = helper.handleValidationErrorDB(err)
    }
    //json web token - invalid signature && jwt malformed
    if (err.name === 'JsonWebTokenError') {
      error = helper.handleJsonWebTokenErrorJWT()
    }
    //json web token - jwt has expired
    if (err.name === 'JsonWebTokenError') {
      error = helper.handleJsonWebTokenExpiredJWT()
    }
    //handle unauthorized 401 error
    if (err.statusCode === 401) {
      error = err
    }
    //handle resource not found 404
    if (err.statusCode === 404) {
      error = err
    }

    sendProductionError(error, res)
  }

}

module.exports = errorHandler