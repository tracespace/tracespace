import {describe, it, beforeEach, expect} from 'vitest'

import * as Parser from '@tracespace/parser'

import * as Tree from '../../tree'
import type {Tool} from '../../tool-store'
import {MACRO_TOOL} from '../../tool-store'
import type {Location} from '../../location-store'

import type {GraphicPlotter} from '..'
import {createGraphicPlotter} from '..'

describe('plot shape macros', () => {
  const node: Parser.Graphic = {
    type: Parser.GRAPHIC,
    graphic: Parser.SHAPE,
    coordinates: {},
  }
  let subject: GraphicPlotter

  beforeEach(() => {
    subject = createGraphicPlotter(Parser.GERBER)
  })

  it('should plot a circle primitive', () => {
    const location = {endPoint: {x: 1, y: 2}} as Location
    const tool: Tool = {
      type: MACRO_TOOL,
      variableValues: [],
      name: 'C',
      dcode: '1',
      macro: [
        {
          type: Parser.MACRO_PRIMITIVE,
          code: Parser.MACRO_CIRCLE,
          parameters: [1, 4, 3, 4, 0],
        },
      ],
    }

    const results = subject.plot(node, tool, location)

    expect(results).to.eql([
      {
        type: Tree.IMAGE_SHAPE,
        polarity: Parser.DARK,
        dcode: '1',
        shape: {
          type: Tree.LAYERED_SHAPE,
          shapes: [{type: Tree.CIRCLE, cx: 4, cy: 6, r: 2, erase: false}],
        },
      },
    ])
  })
})
