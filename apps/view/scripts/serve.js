'use strict'

const path = require('path')
const express = require('express')
const app = express()

const PORT = 9090

app.use(express.static(path.join(__dirname, '../dist')))

app
  .listen(PORT)
  .once('listening', () => console.log(`Listening on http://localhost:${PORT}`))
  .once('error', error => {
    console.error(error)
    process.exit(1)
  })
