import {describe, it, beforeEach, expect} from 'vitest'

import * as Parser from '@tracespace/parser'

import * as Tree from '../../tree'
import {Tool} from '../../tool-store'
import {Location} from '../../location-store'
import {TWO_PI} from '../../coordinate-math'

import {GraphicPlotter, createGraphicPlotter} from '..'

describe('plot stroke arc paths', () => {
  let subject: GraphicPlotter
  let tool: Tool

  beforeEach(() => {
    tool = {shape: {type: Parser.CIRCLE, diameter: 2}}
    subject = createGraphicPlotter()
  })

  it('should plot a zero-length CCW arc as a full circle', () => {
    const location: Location = {
      startPoint: {x: 1, y: 0},
      endPoint: {x: 1, y: 0},
      arcOffsets: {i: -1, j: 0, a: 0},
    }

    subject.plot(
      {type: Parser.INTERPOLATE_MODE, mode: Parser.CCW_ARC},
      tool,
      location
    )
    subject.plot(
      {type: Parser.GRAPHIC, graphic: Parser.SEGMENT, coordinates: {}},
      tool,
      location
    )
    const result = subject.plot({type: Parser.DONE}, tool, location)

    expect(result).to.eql({
      type: Tree.IMAGE_PATH,
      width: 2,
      segments: [
        {
          type: Tree.ARC,
          start: [1, 0, 0],
          end: [1, 0, TWO_PI],
          center: [0, 0],
          radius: 1,
          sweep: TWO_PI,
          direction: Tree.CCW,
        },
      ],
    })

    it('should plot a zero-length CW arc as a full circle', () => {
      const location: Location = {
        startPoint: {x: 1, y: 0},
        endPoint: {x: 1, y: 0},
        arcOffsets: {i: -1, j: 0, a: 0},
      }

      subject.plot(
        {type: Parser.INTERPOLATE_MODE, mode: Parser.CW_ARC},
        tool,
        location
      )
      subject.plot(
        {type: Parser.GRAPHIC, graphic: Parser.SEGMENT, coordinates: {}},
        tool,
        location
      )
      const result = subject.plot({type: Parser.DONE}, tool, location)

      expect(result).to.eql({
        type: Tree.IMAGE_PATH,
        width: 2,
        segments: [
          {
            type: Tree.ARC,
            start: [1, 0, TWO_PI],
            end: [1, 0, 0],
            center: [0, 0],
            radius: 1,
            sweep: TWO_PI,
            direction: Tree.CW,
          },
        ],
      })
    })
  })

  describe.todo('single quadrant mode')
})
