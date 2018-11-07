'use strict'

const fs = require('fs')
const path = require('path')
const runParallel = require('run-parallel')
const runWaterfall = require('run-waterfall')
const pcbStackup = require('..')

const GERBERS_DIR = path.join(__dirname, '../../fixtures/boards/arduino-uno')

const TOP_OUT = path.join(__dirname, 'arduino-uno-top.svg')
const BOTTOM_OUT = path.join(__dirname, 'arduino-uno-bottom.svg')

const GERBER_PATHS = [
  'arduino-uno.cmp',
  'arduino-uno.drd',
  'arduino-uno.gko',
  'arduino-uno.plc',
  'arduino-uno.sol',
  'arduino-uno.stc',
  'arduino-uno.sts',
].map(filename => path.join(GERBERS_DIR, filename))

runWaterfall([renderStackup, writeStackup], error => {
  if (error) return console.error('Error rendering stackup', error)

  console.log(`Wrote:\n  ${TOP_OUT}\n  ${BOTTOM_OUT}`)
})

function renderStackup(done) {
  const layers = GERBER_PATHS.map(filename => ({
    filename,
    gerber: fs.createReadStream(filename),
  }))

  pcbStackup(layers, done)
}

function writeStackup(stackup, done) {
  const tasks = [
    next => fs.writeFile(TOP_OUT, stackup.top.svg, next),
    next => fs.writeFile(BOTTOM_OUT, stackup.bottom.svg, next),
  ]

  runParallel(tasks, done)
}
