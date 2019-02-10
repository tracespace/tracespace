'use strict'

const fs = require('fs')
const path = require('path')
const pump = require('pump')

const gerberToSvg = require('..')

const GERBERS_DIR = path.join(__dirname, '../../fixtures/boards/arduino-uno')
const OUT_DIR = __dirname

const GERBER_PATHS = [
  path.join(GERBERS_DIR, 'arduino-uno.cmp'),
  path.join(GERBERS_DIR, 'arduino-uno.drd'),
  path.join(GERBERS_DIR, 'arduino-uno.gko'),
  path.join(GERBERS_DIR, 'arduino-uno.plc'),
  path.join(GERBERS_DIR, 'arduino-uno.sol'),
  path.join(GERBERS_DIR, 'arduino-uno.stc'),
  path.join(GERBERS_DIR, 'arduino-uno.sts'),
]

GERBER_PATHS.forEach(filename => {
  const name = path.basename(filename)
  const out = path.join(OUT_DIR, `${name}.svg`)

  const file = fs.createReadStream(filename)
  const source = gerberToSvg(file)
  const destination = fs.createWriteStream(out)

  pump(source, destination, error => {
    if (error) return console.error(`Error rendering ${name}`, error)
    console.log(`Wrote: ${out}`)
  })
})
