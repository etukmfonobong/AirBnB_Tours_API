const multer = require('multer')
const customError = require('./errorBuilder')

// const multerStorage = multer.diskStorage({
//   destination: (req, file, cb) => {
//     cb(null, 'public/img/users')
//   },
//   filename: (req, file, cb) => {
//     const ext = file.mimetype.split('/')[1]
//     cb(null, `user-${req.user.id}-${Date.now()}.${ext}`)
//   }
// })

const multerStorage = multer.memoryStorage()

const multerFilter = (req, file, cb) => {
  if (file.mimetype.startsWith('image')) {
    cb(null, true)
  } else {
    cb(new customError('Not an image!, Please upload only images', 400), false)
  }
}

exports.uploadUserPhoto = multer({
  storage: multerStorage,
  fileFilter: multerFilter
})