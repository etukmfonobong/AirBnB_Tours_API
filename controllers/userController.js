const User = require('./../models/userModel')
// const customError = require('./../utilities/errorBuilder')
const sharp = require('sharp')
const controllerFactory = require('./../controllerFactory')
const {filterOutUnwantedFields} = require('./../utilities/globalMethods')
const {uploadUserPhoto} = require('./../utilities/multerMethods')

//handle upload user photo
exports.uploadUserPhoto = uploadUserPhoto

//resize user photo
exports.resizeUserPhoto = async (req, res, next) => {
  try {
    if (!req.file) return next

    req.file.filename = `user-${req.user.id}-${Date.now()}.jpeg`

    await sharp(req.file.buffer)
      .resize(500, 500)
      .toFormat('jpeg')
      .jpeg({quality: 90})
      .toFile(`public/img/users/${req.file.filename}`)

    //if everything is ok
    next()
  } catch (e) {
    //create an error message if an error occurs
    return next(e)
  }
}

//update me
exports.updateMe = async (req, res, next) => {
  const filteredBody = filterOutUnwantedFields(req.body, ['name', 'email'])
  if (req.file) filteredBody.photo = req.file.filename

  try {
    const updatedUser = await User.findByIdAndUpdate(req.user._id, filteredBody, {
      new: true,
      runValidators: true
    })
    //if everything is ok send token to client
    await res.status(200).json({
      status: 'success',
      data: {
        updatedUser
      }
    })
  } catch (e) {
    //create an error message if an error occurs
    return next(e)
  }
}

//delete me
exports.deleteMe = async (req, res, next) => {
  try {
    await User.findByIdAndUpdate(req.user._id, {active: false})
    //if everything is ok send token to client
    await res.status(204).json({
      status: 'success',
      data: null
    })
  } catch (e) {
    //create an error message if an error occurs
    return next(e)
  }
}

exports.getMe = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id)
    //if everything is ok send token to client
    await res.status(200).json({
      status: 'success',
      data: {
        user
      }
    })
  } catch (e) {
    //create an error message if an error occurs
    return next(e)
  }
}

//get all users
exports.getAllUsers = controllerFactory.getAll(User)

//create user
exports.createUser = (req, res) => {
  res.status(201)
    .json({
      status: 'success',
      data: {
        message: 'route not yet implemented use /signUp instead'
      }
    })
}

//get a user
exports.getUser = controllerFactory.getOne(User)

//update a user
//this route is for admin only
exports.updateUser = controllerFactory.updateOne(User, ['active', 'role'])

//delete single user
exports.deleteUser = controllerFactory.deleteOne(User)