// Tests for the LocationStore
import {describe, it, beforeEach, expect} from 'vitest'

import * as Parser from '@tracespace/parser'

import {PlotOptions} from '../options'
import {LocationStore, createLocationStore} from '../location-store'

describe('location store', () => {
  let subject: LocationStore
  let options: PlotOptions

  beforeEach(() => {
    subject = createLocationStore()
    options = {} as PlotOptions
  })

  it('should return origin by default', () => {
    const result = subject.use(
      {type: Parser.COMMENT, comment: 'hello'},
      options
    )

    expect(result).to.eql([
      {x: 0, y: 0},
      {x: 0, y: 0},
      {i: 0, j: 0, a: 0},
    ])
  })

  it('should parse graphic nodes with decimal coordinates', () => {
    const node: Parser.Graphic = {
      type: Parser.GRAPHIC,
      graphic: Parser.MOVE,
      coordinates: {x: '1.234', y: '5.678'},
    }
    const result = subject.use(node, options)

    expect(result).to.eql([
      {x: 0, y: 0},
      {x: 1.234, y: 5.678},
      {i: 0, j: 0, a: 0},
    ])
  })

  it('should maintain coordinate state', () => {
    const node1: Parser.Graphic = {
      type: Parser.GRAPHIC,
      graphic: Parser.MOVE,
      coordinates: {x: '1.234', y: '5.678'},
    }
    const node2: Parser.Graphic = {
      type: Parser.GRAPHIC,
      graphic: Parser.MOVE,
      coordinates: {x: '0'},
    }
    const node3: Parser.Graphic = {
      type: Parser.GRAPHIC,
      graphic: Parser.MOVE,
      coordinates: {y: '0'},
    }
    const noopNode: Parser.Comment = {type: Parser.COMMENT, comment: 'hello'}

    expect(subject.use(node1, options)).to.eql([
      {x: 0, y: 0},
      {x: 1.234, y: 5.678},
      {i: 0, j: 0, a: 0},
    ])
    expect(subject.use(noopNode, options)).to.eql([
      {x: 1.234, y: 5.678},
      {x: 1.234, y: 5.678},
      {i: 0, j: 0, a: 0},
    ])
    expect(subject.use(node2, options)).to.eql([
      {x: 1.234, y: 5.678},
      {x: 0, y: 5.678},
      {i: 0, j: 0, a: 0},
    ])
    expect(subject.use(noopNode, options)).to.eql([
      {x: 0, y: 5.678},
      {x: 0, y: 5.678},
      {i: 0, j: 0, a: 0},
    ])
    expect(subject.use(node3, options)).to.eql([
      {x: 0, y: 5.678},
      {x: 0, y: 0},
      {i: 0, j: 0, a: 0},
    ])
  })

  it('should parse a coordinate string according to the format', () => {
    options = {coordinateFormat: [3, 5]} as PlotOptions
    const node: Parser.Graphic = {
      type: Parser.GRAPHIC,
      graphic: Parser.MOVE,
      coordinates: {x: '12345678'},
    }

    const [, result] = subject.use(node, options)
    expect(result.x).to.equal(123.456_78)
  })

  it('should parse a coordinate string with leading zero suppression', () => {
    options = {
      coordinateFormat: [3, 5],
      zeroSuppression: Parser.LEADING,
    } as PlotOptions

    const node: Parser.Graphic = {
      type: Parser.GRAPHIC,
      graphic: Parser.MOVE,
      coordinates: {x: '123456'},
    }

    const [, result] = subject.use(node, options)
    expect(result.x).to.equal(1.234_56)
  })

  it('should parse a coordinate string with trailing zero suppression', () => {
    options = {
      coordinateFormat: [3, 5],
      zeroSuppression: Parser.TRAILING,
    } as PlotOptions

    const node: Parser.Graphic = {
      type: Parser.GRAPHIC,
      graphic: Parser.MOVE,
      coordinates: {x: '123456'},
    }

    const [, result] = subject.use(node, options)
    expect(result.x).to.equal(123.456)
  })

  it('should parse a coordinate string with an explicit sign', () => {
    options = {
      coordinateFormat: [3, 3],
      zeroSuppression: Parser.LEADING,
    } as PlotOptions

    const node: Parser.Graphic = {
      type: Parser.GRAPHIC,
      graphic: Parser.MOVE,
      coordinates: {x: '+1234', y: '-5678'},
    }

    const [, result] = subject.use(node, options)
    expect(result.x).to.equal(1.234)
    expect(result.y).to.equal(-5.678)
  })

  it('should parse `i`, `j` arc coordinates', () => {
    options = {coordinateFormat: [1, 2]} as PlotOptions

    const node: Parser.Graphic = {
      type: Parser.GRAPHIC,
      graphic: Parser.SEGMENT,
      coordinates: {x: '123', y: '456', i: '789', j: '987'},
    }

    const [, pointResult, offsetsResult] = subject.use(node, options)
    expect(pointResult).to.eql({x: 1.23, y: 4.56})
    expect(offsetsResult).to.eql({i: 7.89, j: 9.87, a: 0})
  })

  it('should parse `a` arc coordinates', () => {
    options = {coordinateFormat: [1, 2]} as PlotOptions

    const node: Parser.Graphic = {
      type: Parser.GRAPHIC,
      graphic: Parser.SEGMENT,
      coordinates: {x: '123', y: '456', a: '789'},
    }

    const [, pointResult, offsetsResult] = subject.use(node, options)
    expect(pointResult).to.eql({x: 1.23, y: 4.56})
    expect(offsetsResult).to.eql({i: 0, j: 0, a: 7.89})
  })

  it('should parse `x0`, `y0` slot coordinates', () => {
    options = {coordinateFormat: [1, 2]} as PlotOptions

    const node: Parser.Graphic = {
      type: Parser.GRAPHIC,
      graphic: Parser.SLOT,
      coordinates: {x0: '123', y0: '456', x: '789', y: '987'},
    }

    const [previous, next] = subject.use(node, options)
    expect(previous).to.eql({x: 1.23, y: 4.56})
    expect(next).to.eql({x: 7.89, y: 9.87})
  })

  it('should feed `x`, `y` with `x0`, `y0` coordinates', () => {
    options = {coordinateFormat: [1, 2]} as PlotOptions

    const node1: Parser.Graphic = {
      type: Parser.GRAPHIC,
      graphic: Parser.SLOT,
      coordinates: {x0: '123', y: '987'},
    }

    const node2: Parser.Graphic = {
      type: Parser.GRAPHIC,
      graphic: Parser.SLOT,
      coordinates: {y0: '456', x: '789'},
    }

    const [previous1, next1] = subject.use(node1, options)
    expect(previous1).to.eql({x: 1.23, y: 0})
    expect(next1).to.eql({x: 1.23, y: 9.87})

    const [previous2, next2] = subject.use(node2, options)
    expect(previous2).to.eql({x: 1.23, y: 4.56})
    expect(next2).to.eql({x: 7.89, y: 4.56})
  })
})
