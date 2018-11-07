'use strict'

const options = require('./options')

module.exports = [
  {
    cmd: '$0',
    desc: 'Render files in `cwd` and output to `cwd`',
  },
  {
    cmd: '$0 --out=-',
    desc: 'Render files in `cwd` and output to `stdout`',
  },
  ...Object.keys(options).map(name => options[name].example),
]
