/* eslint-env mocha */
'use strict'

var expect = require('chai').expect

var PathGraph = require('../lib/path-graph')

describe('path graphs', function() {
  var p
  beforeEach(function() {
    p = new PathGraph(true)
  })

  it('should be able to traverse', function() {
    expect(p.traverse()).to.eql([])
  })

  it('should be able to add to and traverse a path graph', function() {
    p.add({type: 'line', start: [0, 0], end: [1, 0]})
    p.add({type: 'line', start: [1, 0], end: [1, 1]})
    p.add({type: 'line', start: [1, 1], end: [0, 1]})
    p.add({type: 'line', start: [0, 1], end: [0, 0]})

    expect(p.traverse()).to.eql([
      {type: 'line', start: [0, 0], end: [1, 0]},
      {type: 'line', start: [1, 0], end: [1, 1]},
      {type: 'line', start: [1, 1], end: [0, 1]},
      {type: 'line', start: [0, 1], end: [0, 0]},
    ])
  })

  it('should reverse line segments during traversal', function() {
    p.add({type: 'line', start: [0, 0], end: [1, 1]})
    p.add({type: 'line', start: [1, 0], end: [1, 1]})

    expect(p.traverse()).to.eql([
      {type: 'line', start: [0, 0], end: [1, 1]},
      {type: 'line', start: [1, 1], end: [1, 0]},
    ])
  })

  it('should traverse multiple trees', function() {
    p.add({type: 'line', start: [0, 0], end: [1, 1]})
    p.add({type: 'line', start: [1, 1], end: [1, 2]})
    p.add({type: 'line', start: [2, 2], end: [3, 3]})
    p.add({type: 'line', start: [3, 3], end: [3, 4]})

    expect(p.traverse()).to.eql([
      {type: 'line', start: [0, 0], end: [1, 1]},
      {type: 'line', start: [1, 1], end: [1, 2]},
      {type: 'line', start: [2, 2], end: [3, 3]},
      {type: 'line', start: [3, 3], end: [3, 4]},
    ])
  })

  // depth first traversal is used so that when converted to an SVG path it
  // retains its shape. see discussion:
  // https://github.com/mcous/gerber-plotter/pull/13
  it('should traverse the graph depth first', function() {
    p.add({type: 'line', start: [0, 0], end: [1, 0]})
    p.add({type: 'line', start: [0, 0], end: [-1, 0]})
    p.add({type: 'line', start: [0, 1], end: [1, 1]})
    p.add({type: 'line', start: [-1, -1], end: [0, -1]})
    p.add({type: 'line', start: [0, 0], end: [0, 1]})
    p.add({type: 'line', start: [0, 0], end: [0, -1]})
    p.add({type: 'line', start: [1, 0], end: [1, 1]})
    p.add({type: 'line', start: [-1, 0], end: [-1, -1]})

    expect(p.traverse()).to.eql([
      {type: 'line', start: [0, 0], end: [1, 0]},
      {type: 'line', start: [1, 0], end: [1, 1]},
      {type: 'line', start: [1, 1], end: [0, 1]},
      {type: 'line', start: [0, 1], end: [0, 0]},
      {type: 'line', start: [0, 0], end: [-1, 0]},
      {type: 'line', start: [-1, 0], end: [-1, -1]},
      {type: 'line', start: [-1, -1], end: [0, -1]},
      {type: 'line', start: [0, -1], end: [0, 0]},
    ])
  })

  it('should reverse arc segments during traversal', function() {
    var HALF_PI = Math.PI / 2
    p.add({type: 'line', start: [0, 0], end: [1, 0]})
    p.add({
      type: 'arc',
      start: [2, 1, 0],
      end: [1, 0, 3 * HALF_PI],
      center: [1, 1],
      sweep: HALF_PI,
      radius: 1,
      dir: 'cw',
    })
    p.add({
      type: 'arc',
      start: [3, 2, HALF_PI],
      end: [2, 1, Math.PI],
      center: [3, 1],
      sweep: HALF_PI,
      radius: 1,
      dir: 'ccw',
    })

    expect(p.traverse()).to.eql([
      {type: 'line', start: [0, 0], end: [1, 0]},
      {
        type: 'arc',
        start: [1, 0, 3 * HALF_PI],
        end: [2, 1, 0],
        center: [1, 1],
        sweep: HALF_PI,
        radius: 1,
        dir: 'ccw',
      },
      {
        type: 'arc',
        start: [2, 1, Math.PI],
        end: [3, 2, HALF_PI],
        center: [3, 1],
        sweep: HALF_PI,
        radius: 1,
        dir: 'cw',
      },
    ])
  })

  it('should have a length property', function() {
    expect(p.length).to.equal(0)
    p.add({type: 'line', start: [0, 0], end: [1, 0]})
    p.add({type: 'line', start: [0, 0], end: [-1, 0]})
    p.add({type: 'line', start: [0, 1], end: [1, 1]})
    expect(p.length).to.equal(3)
  })

  it('should not allow duplicate line segments', function() {
    p.add({type: 'line', start: [0, 0], end: [1, 0]})
    p.add({type: 'line', start: [1, 0], end: [0, 0]})
    p.add({type: 'line', start: [0, 0], end: [1, 0]})
    p.traverse()
    expect(p.length).to.equal(1)
  })

  it('should not allow duplicate line segments but it should continue', function() {
    p.add({type: 'line', start: [1, 0], end: [1, 2]})
    p.add({type: 'line', start: [0, 0], end: [1, 0]})
    p.add({type: 'line', start: [1, 0], end: [0, 0]})
    p.add({type: 'line', start: [0, 0], end: [1, 0]})
    p.add({type: 'line', start: [1, 0], end: [1, 2]})
    p.add({type: 'line', start: [1, 2], end: [1, 3]})
    p.add({type: 'line', start: [1, 3], end: [2, 3]})
    p.add({type: 'line', start: [1, 3], end: [2, 3]})
    p.traverse()
    expect(p.length).to.equal(4)
  })

  it('should not optimize the path if passed a false during construction', function() {
    p = new PathGraph(false)

    p.add({type: 'line', start: [0, 0], end: [1, 0]})
    p.add({type: 'line', start: [0, 0], end: [-1, 0]})
    p.add({type: 'line', start: [0, 1], end: [1, 1]})
    p.add({type: 'line', start: [-1, -1], end: [0, -1]})
    p.add({type: 'line', start: [0, 0], end: [0, 1]})
    p.add({type: 'line', start: [0, 0], end: [0, -1]})
    p.add({type: 'line', start: [1, 0], end: [1, 1]})
    p.add({type: 'line', start: [-1, 0], end: [-1, -1]})

    expect(p.traverse()).to.eql([
      {type: 'line', start: [0, 0], end: [1, 0]},
      {type: 'line', start: [0, 0], end: [-1, 0]},
      {type: 'line', start: [0, 1], end: [1, 1]},
      {type: 'line', start: [-1, -1], end: [0, -1]},
      {type: 'line', start: [0, 0], end: [0, 1]},
      {type: 'line', start: [0, 0], end: [0, -1]},
      {type: 'line', start: [1, 0], end: [1, 1]},
      {type: 'line', start: [-1, 0], end: [-1, -1]},
    ])
  })

  it('should be able to fill gaps', function() {
    p = new PathGraph(true, 0.00011)

    p.add({type: 'line', start: [0, 0], end: [1.0001, 0]})
    p.add({type: 'line', start: [1, 0], end: [1.0001, 1]})
    p.add({type: 'line', start: [1, 1], end: [0, 1.0001]})
    p.add({type: 'line', start: [0, 1], end: [0, 0]})

    expect(p.traverse()).to.eql([
      {type: 'line', start: [0, 0], end: [1, 0]},
      {type: 'line', start: [1, 0], end: [1, 1]},
      {type: 'line', start: [1, 1], end: [0, 1]},
      {type: 'line', start: [0, 1], end: [0, 0]},
    ])
  })

  it('should be able to fill gaps with a specified gap distance', function() {
    p = new PathGraph(true, 0.0011)

    p.add({type: 'line', start: [0, 0], end: [1.001, 0]})
    p.add({type: 'line', start: [1, 0], end: [1.001, 1]})
    p.add({type: 'line', start: [1, 1], end: [0, 1.001]})
    p.add({type: 'line', start: [0, 1], end: [0, 0]})

    expect(p.traverse()).to.eql([
      {type: 'line', start: [0, 0], end: [1, 0]},
      {type: 'line', start: [1, 0], end: [1, 1]},
      {type: 'line', start: [1, 1], end: [0, 1]},
      {type: 'line', start: [0, 1], end: [0, 0]},
    ])
  })

  it('should find the closest point when filling gaps', function() {
    p = new PathGraph(true, 0.06)

    p.add({type: 'line', start: [0, 0], end: [1, 0]})
    p.add({type: 'line', start: [1.01, 0], end: [1.03, 0]})
    p.add({type: 'line', start: [1.03, 0], end: [1.04, 0.01]})
    p.add({type: 'line', start: [1.04, 0.01], end: [2, 2]})

    expect(p.traverse()).to.eql([
      {type: 'line', start: [0, 0], end: [1.01, 0]},
      {type: 'line', start: [1.01, 0], end: [1.03, 0]},
      {type: 'line', start: [1.03, 0], end: [1.04, 0.01]},
      {type: 'line', start: [1.04, 0.01], end: [2, 2]},
    ])
  })
})
