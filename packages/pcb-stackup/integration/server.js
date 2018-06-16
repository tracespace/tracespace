// simple visual test server for pcb-stackup
'use strict'

const {getBoards, server} = require('@tracespace/fixtures')
const {name} = require('../package.json')
const getBoardResults = require('./get-results')

const PORT = 8000

server(name, getBoards, getBoardResults).listen(PORT, () =>
  console.log(`Listening at http://localhost:${PORT}`)
)
