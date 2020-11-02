const fs = require('fs')
const path = require('path')

exports.setDataUsers = () => {
//read tours.json
  return JSON.parse(fs.readFileSync(path.join(__dirname + '/users.json'), 'utf-8'))
}