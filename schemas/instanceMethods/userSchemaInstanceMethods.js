const bcrypt = require('bcrypt')
const crypto = require('crypto')

/**
 * Validate password
 * True - verification passed
 * False - verification failed
 * @param requestPassword
 * @param dbPassword
 * @returns {Promise<*>}
 */
exports.verifyPassword = async function (requestPassword, dbPassword) {
  return await bcrypt.compare(requestPassword, dbPassword)
}

/**
 * Check if JWT was issued before the last time password was changed
 * True - verification passed
 * False - verification failed
 * @param JWTtimeStamp
 * @returns {Promise<boolean>}
 */
exports.changedPassword = async function (JWTtimeStamp) {
  //if false verification failed
  if (this["passwordChangedAt"]) {
    const passwordTimeStamp = parseInt(`${this["passwordChangedAt"].getTime() / 1000}`, 10)
    return JWTtimeStamp > passwordTimeStamp
  }
  //if no passwordChangedAt user has never changed password - verification passes
  return true
}

exports.createPasswordResetToken = async function () {
  //create reset token
  const resetToken = crypto.randomBytes(36).toString('hex')

  //hash reset token
  this["passwordResetToken"] = crypto.createHash('sha256').update(resetToken).digest('hex')

  //set reset token expiry time - 10 mins
  this["passwordResetTokenExpiresAt"] = Date.now() + 10 * 60 * 1000

  return resetToken
}