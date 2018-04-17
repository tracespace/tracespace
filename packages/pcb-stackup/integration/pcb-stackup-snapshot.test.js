// pcb-stackup-core render snapshot tests
'use strict'

const format = require('xml-formatter')
const snapshot = require('snap-shot-it')

const {getBoards} = require('@tracespace/fixtures')
const getResults = require('./get-results')

const SIDES = ['top', 'bottom']
const BOARDS = getBoards.sync().filter(b => !b.skipSnapshot)

describe(`pcb-stackup :: integration snapshots`, function () {
  let renderedBoards

  before(function (done) {
    if (process.env.INTEGRATION !== '1') return this.skip()

    getResults(BOARDS, (error, results) => {
      if (error) return done(error)
      renderedBoards = results
      done()
    })
  })

  BOARDS.forEach((board, index) => {
    SIDES.forEach(side => {
      it(`renders ${board.name} ${side}`, function () {
        const rendered = renderedBoards[index]
        snapshot(format(rendered.stackup[side].svg).split('\n'))
      })
    })
  })
})
