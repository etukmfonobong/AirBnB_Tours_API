const fs = require('fs')
const path = require('path')

exports.setDataTours = () => {
//read tours.json
  return JSON.parse(fs.readFileSync(path.join(__dirname + '/tours.json'), 'utf-8'))
}