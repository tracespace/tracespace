// simple visual test server for pcb-stackup-core
'use strict'

const {getBoards, server} = require('@tracespace/fixtures')
const {name} = require('../package.json')
const getBoardResults = require('./get-results')

const PORT = 8001

server(name, getBoards, getBoardResults).listen(PORT, () =>
  console.log(`Listening at http://localhost:${PORT}`)
)
