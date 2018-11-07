'use strict'

const path = require('path')
const untildify = require('untildify')

module.exports = function resolve(filename) {
  return path.resolve(process.cwd(), untildify(filename))
}
