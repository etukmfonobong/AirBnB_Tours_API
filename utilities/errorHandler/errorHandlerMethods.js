const customError = require('./../errorBuilder')

exports.handleCastErrorDB = (error) => {
  const message = `Invalid ${error.path} : ${error.value}.`
  return new customError(message, 400)
}

exports.handleDuplicateFieldsDB = (error) => {
  let value = error["errmsg"].match(/(["'])(\\?.)*?\1/)[0]
  if (!value) value = 'Duplicate records'
  const message = `Duplicate field value : ${value}. Please use another value.`
  return new customError(message, 400)
}

exports.handleValidationErrorDB = (error) => {
  const errors = Object.values(error.errors).map(el => el.message)
  const message = `Invalid input data. ${errors.join('. ')}.`
  return new customError(message, 400)
}

exports.handleJsonWebTokenErrorJWT = () => {
  const message = `Invalid token. Please login again`
  return new customError(message, 401)
}

exports.handleJsonWebTokenExpiredJWT = () => {
  const message = `Token expired. Please login again`
  return new customError(message, 401)
}