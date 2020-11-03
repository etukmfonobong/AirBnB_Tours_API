const User = require('./../models/userModel')//user model import
const customError = require('./../utilities/errorBuilder')//error builder middleware
const {createToken, verifyToken} = require('./../utilities/jwtMethods')
const {sendEmail} = require('./../utilities/emailMethods')
const Email = require('./../utilities/emailMethods')

const crypto = require('crypto')

//Sign up user
exports.signUp = async (req, res, next) => {
  try {
    //try to create and save new user
    const newUser = await User.create({
      name: req.body.name,
      email: req.body.email,
      password: req.body.password,
      passwordConfirm: req.body.passwordConfirm
    })
    //create a token for new user
    const token = await createToken(newUser._id)

    //remove password and active from output
    newUser.password = undefined
    newUser.active = undefined

    req.token = token
    req.newUser = newUser

    //send welcome email
    const url = `${req.protocol}://${req.get('host')}/settings/account-settings`
    await new Email(newUser, url).sendWelcome()
    next()

  } catch (e) {
    //create an error message if an error occurs
    return next(e)
  }

}

//Login user
exports.logIn = async (req, res, next) => {
  try {
    const {email, password} = req.body

    //check if there is actually an email and password in req.body
    if (!email || !password) {
      return next(new customError('Please provide an email and password!', 400))
    }

    //check if user exists
    const user = await User.findOne({email}).select('+password')

    if (!user || !await user.verifyPassword(password, user.password)) {
      return next(new customError('Invalid email or password', 401))
    }
    //create token
    req.token = await createToken(user._id)
    next()


  } catch (e) {
    //create an error message if an error occurs
    return next(e)
  }

}

//create and split jwt
exports.secureToken = async (req, res, next) => {
  try {
    const token = req.token
    //split token into header + payload and signature
    const split = token.split('.')
    const headerToken = split[0].concat('.', split[1])
    const signature = split[2]

    const sameSite = process.env.NODE_ENV === 'production' ? 'none' : 'lax'

    const farFuture = new Date(Date.now() + 1000 * 60 * 60 * 24 * 365 * 10)
    //send two separate cookies with the signature cookie set to http only
    res.cookie('jwtsig', signature, {
      expires: farFuture,
      // expiresIn: new Date(Date.now() + process.env.JWT_COOKIE_EXPIRES_IN * 24 * 60 * 60 * 1000),
      domain: '.airbnb-tours-etukmfon.herokuapp.com',
      secure: process.env.NODE_ENV === 'production',
      sameSite: sameSite,
      httpOnly: true
    })

    res.cookie('jwthandp', headerToken, {
      expires: farFuture,
      // expiresIn: new Date(Date.now() + process.env.JWT_COOKIE_EXPIRES_IN * 24 * 60 * 60 * 1000),
      domain: '.airbnb-tours-etukmfon.herokuapp.com',
      secure: process.env.NODE_ENV === 'production',
      sameSite: sameSite,
    })


    if (req["newUser"]) {
      //if successful send back response with new user object
      await res.status(201)
        .json({
          status: 'success',
          token,
          data: {
            user: req.newUser
          }
        })
    } else {
      // res
      //   .writeHead(200, {
      //     "Set-Cookie": "token=encryptedstring",
      //     "Access-Control-Allow-Credentials": "true"
      //   })
      //   .send();
      // send response for log in
      await res.status(200).json({
        status: 'success',
        data: {
          token
        }
      })
    }
  } catch (e) {
    //create an error message if an error occurs
    return next(e)
  }
}

//create bearer token from incomming cookies
exports.createBearerToken = (req, res, next) => {
  const rawCookies = req.headers.cookie.split('; ')

  const parsedCookies = {}
  rawCookies.forEach(rawCookie => {
    const parsedCookie = rawCookie.split('=')
    parsedCookies[parsedCookie[0]] = parsedCookie[1]
  })

  const token = parsedCookies['jwthandp'].concat('.', parsedCookies['jwtsig'])

  req.headers.authorization = `Bearer ${token}`

  next()
}

//Checks if the current incoming request has a valid JSON web token
exports.protect = async (req, res, next) => {
  try {
    //check if token exists in req.headers - we are using Bearer token format
    if (!req.headers.authorization || !req.headers.authorization.startsWith('Bearer')) {
      return next(new customError('You are not logged in!, please log in in to get access', 401))
    }

    const token = req.headers.authorization.split(' ')[1]//assign request token to variable

    const decoded = await verifyToken(token)//verify token

    //check if user still exists
    const requestUser = await User.findById(decoded.id)
    if (!requestUser) {
      return next(new customError('The user belonging to this token no longer exists', 401))
    }

    //Check if user has recently changed password
    if (!await requestUser.changedPassword(decoded.iat)) {
      return next(new customError('Password was recently changed, please login again', 401))
    }

    //if the code reaches this point attach user to request object
    req.user = requestUser

    //if everything is ok proceed to next middleware
    next()
  } catch (e) {
    //create an error message if an error occurs
    return next(e)
  }
}

//Autourization - restricts resource access based on req.user.role
exports.restrictTo = (...roles) => {
  return async (req, res, next) => {
    try {
      if (!roles.includes(req.user.role)) {
        return next(new customError('You do not have permission to perform this action!', 403))
      }
      //if everything is ok proceed to next middleware
      next()
    } catch (e) {
      //create an error message if an error occurs
      return next(e)
    }
  }
}

exports.forgotPassword = async (req, res, next) => {
  try {
    //get user based on email
    const user = await User.findOne({email: req.body.email})
    if (!user) {
      return next(new customError('There is no user with that email address', 404))
    }

    //generate password reset token
    const resetToken = await user.createPasswordResetToken()
    await user.save({validateBeforeSave: false})//save changes made in the createPasswordResetToken method

    //if everything is ok send password reset link to email
    const resetURL = `${req.protocol}://${req.get('host')}/api/v1/users/reset-password/${resetToken}`

    try {
      //try to send email
      await new Email(user, resetURL).sendPasswordReset()

      //if everything is ok send success message to client
      await res.status(200).json({
        status: 'success',
        message: 'reset link sent to email!'
      })

    } catch (e) {
      //if for some reason there is an error
      //reset passwordRestToken and expiry
      user.passwordResetToken = undefined
      user.passwordResetTokenExpiresAt = undefined
      //send error message
      return next(e)
    }


  } catch (e) {
    //create an error message if an error occurs
    return next(e)
  }
}

exports.resetPassword = async (req, res, next) => {
  try {
    //get user based on token
    //hash token from params
    const resetToken = crypto.createHash('sha256').update(req.params.token).digest('hex')
    //try to find user that has token && passwordResetTokenExpiresAt > than right now
    const user = await User.findOne({
      passwordResetToken: resetToken,
      passwordResetTokenExpiresAt: {$gt: Date.now()}
    })
    if (!user) {
      return next(new customError('Token is invalid or has expired', 400))
    }

    //if there is a user try to set and save new password
    try {
      user.password = req.body.password
      user.passwordConfirm = req.body.passwordConfirm
      user.passwordResetToken = undefined
      user.passwordResetTokenExpiresAt = undefined

      await user.save()

    } catch (e) {
      return next(new customError(e))
    }

    //if everything is ok re-log user in
    const token = await createToken(user._id)

    res.cookie('jwt', token, {
      expiresIn: new Date(Date.now() + process.env.JWT_COOKIE_EXPIRES_IN * 24 * 60 * 60 * 1000),
      // secure: true,
      httpOnly: true
    })

    await res.status(200).json({
      status: 'success',
      data: {
        token
      }
    })
  } catch (e) {
    //create an error message if an error occurs
    return next(e)
  }
}

exports.updatePassword = async (req, res, next) => {
  try {
    //check if expected inputs exist
    const {password, newPassword, passwordConfirm} = req.body
    if (!password || !newPassword || !passwordConfirm) {
      return next(new customError('Invalid inputs', 400))
    }

    //get request user
    const user = await User.findById(req.user._id).select('+password')

    //verify password
    if (!user || !await user.verifyPassword(password, user.password)) {
      return next(new customError('Invalid password', 401))
    }

    //set and save  new password
    user.password = newPassword
    user.passwordConfirm = passwordConfirm
    await user.save()

    //create token
    const token = await createToken(user._id)

    res.cookie('jwt', token, {
      expiresIn: new Date(Date.now() + process.env.JWT_COOKIE_EXPIRES_IN * 24 * 60 * 60 * 1000),
      // secure: true,
      httpOnly: true
    })

    //if everything is ok send token to client
    await res.status(200).json({
      status: 'success',
      data: {
        token
      }
    })
  } catch (e) {
    //create an error message if an error occurs
    return next(e)
  }
}


