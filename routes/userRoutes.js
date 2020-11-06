const express = require('express')
const router = express.Router()


const userController = require('./../controllers/userController') //user controller
const authController = require('./../controllers/authController') //auth controller

router.post('/signup', authController.signUp, authController.secureToken)
router.post('/login', authController.logIn, authController.secureToken)
router.get('/logout', authController.removeCookies)

router.get(
  '/get-me',
  authController.createBearerToken,
  authController.protect,
  authController.restrictTo('user', 'admin', 'guide'),
  userController.getMe
)
router.patch(
  '/update-me',
  authController.createBearerToken,
  authController.protect,
  userController.uploadUserPhoto.single('photo'),
  userController.resizeUserPhoto,
  userController.updateMe
)
router.delete('/delete-me', authController.protect, userController.deleteMe)

router.post('/forgot-password', authController.forgotPassword)
router.patch('/reset-password/:token', authController.resetPassword)
router.patch('/update-password',
  authController.createBearerToken,
  authController.protect,
  authController.updatePassword
)

router
  .route('/')
  .get(authController.protect, authController.restrictTo('admin'), userController.getAllUsers)
  .post(userController.createUser)

router
  .route('/:id')
  .get(
    authController.protect,
    authController.restrictTo('adimn'),
    userController.getUser
  )
  .patch(
    authController.protect,
    authController.restrictTo('adimn'),
    userController.updateUser
  )
  .delete(
    authController.protect,
    authController.restrictTo('admin'),
    userController.deleteUser
  )

module.exports = router