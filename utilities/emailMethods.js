const nodemailer = require('nodemailer')
const pug = require('pug')
const htmlToText = require('html-to-text')

module.exports = class Email {
  constructor(user, url) {
    this.to = user.email
    this.firstName = user.name.split(' ')[0]
    this.url = url
    this.from = `AirBnB Tours ${process.env.EMAIL_FROM}`
  }

  newTransport() {
    if (process.env.NODE_ENV === 'production') {
      //mailgun
      return nodemailer.createTransport({
        service: "Mailgun",
        auth: {
          user: process.env.MAIL_GUN_USERNAME,
          pass: process.env.MAIL_GUN_PASSWORD
        }
      })
    }

    if (process.env.NODE_ENV === 'development') {
      //mailtrap
      return nodemailer.createTransport({
        host: process.env.EMAIL_HOST,
        port: process.env.EMAIL_PORT,
        auth: {
          user: process.env.EMAIL_USERNAME,
          pass: process.env.EMAIL_PASSWORD
        }
      })
    }
  }

  async sendEmail(template, subject) {
    //create html from pug template
    const html = pug.renderFile(`${__dirname}/../templates/emails/${template}.pug`, {
      firstName: this.firstName,
      url: this.url,
      subject
    })

    //mail options
    const mailOptions = {
      from: this.from,
      to: this.to,
      subject: subject,
      html: html,
      text: htmlToText.fromString(html)
    }

    //send email
    await this.newTransport().sendMail(mailOptions)
  }

  async sendWelcome() {
    await this.sendEmail('welcome', 'Welcome to the AirBnB Tours family!')
  }

  async sendPasswordReset() {
    await this.sendEmail('passwordReset', 'Your password reset token (valid for only 10 minutes)')
  }
}

/**
 * send email with node mailer helper function
 * @param options
 * @returns {Promise<void>}
 */
exports.sendEmail = async (options) => {
  //define transporter
  const transport = nodemailer.createTransport({
    host: process.env.EMAIL_HOST,
    port: process.env.EMAIL_PORT,
    auth: {
      user: process.env.EMAIL_USERNAME,
      pass: process.env.EMAIL_PASSWORD
    }
  });

  //define mail options
  const mailOptions = {
    from: 'AirBnB Tours <AirBnB@tours.io>',
    to: options.email,
    subject: options.subject,
    text: options.message
  }

  //actually send the email
  await transport.sendMail(mailOptions)

}
