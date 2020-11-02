const fs = require('fs')
const path = require('path')

exports.setDataReviews = () => {
//read tours.json
  return JSON.parse(fs.readFileSync(path.join(__dirname + '/reviews.json'), 'utf-8'))
}
