const jwt = require('jsonwebtoken')

exports.createToken = async (id) => {
  return await jwt.sign({id: id}, process.env.JWT_SECRET, {
    expiresIn: "60d"
  })
}

exports.verifyToken = async (token) => {
  return await jwt.verify(token, process.env.JWT_SECRET)
}