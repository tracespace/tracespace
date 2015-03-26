# tests for the board shape function
expect = require('chai').expect
find = require 'lodash.find'
boardShape = require '../src/lib/board-shape'
Point = require '../src/lib/board-shape/point'
gatherPoints = require '../src/lib/board-shape/gather-points'
traversePoints = require '../src/lib/board-shape/traverse-points'

describe 'client-lib-boardShape', ->

  describe 'Point class', ->
    it 'should take in a location coordinate', ->
      pt = new Point 1, 2
      expect(pt.x).to.equal 1
      expect(pt.y).to.equal 2

    it 'should have an edges array', ->
      pt = new Point()
      expect(pt.edges).exist

    it 'should be able add adjacent points', ->
      pt1 = new Point 0, 0
      pt2 = new Point 1, 1
      pt1.addEdgeTo pt2
      expect(pt1.edges[0]).to.have.property 'point', pt2
      expect(pt2.edges[0]).to.have.property 'point', pt1

    it 'should not duplicate edges', ->
      pt1 = new Point 0, 0
      pt2 = new Point 1, 1
      pt1.addEdgeTo pt2
      pt2.addEdgeTo pt1
      expect(pt1.edges).to.have.length 1
      expect(pt2.edges).to.have.length 1

    it 'should be able to say the edge to an adjacent point is an arc', ->
      pt1 = new Point 0, 0
      pt2 = new Point 1, 1
      pt1.addEdgeTo pt2, radius = 1, largeArc = 0, sweep = 0
      expect(pt1.edges[0].radius).to.equal 1
      expect(pt1.edges[0].largeArc).to.equal 0
      expect(pt1.edges[0].sweep).to.equal 0
      expect(pt2.edges[0].radius).to.equal 1
      expect(pt2.edges[0].largeArc).to.equal 0
      expect(pt2.edges[0].sweep).to.equal 1
      pt3 = new Point 0, 0
      pt4 = new Point 1, 1
      pt3.addEdgeTo pt4, radius = 1, largeArc = 0, sweep = 1
      expect(pt3.edges[0].radius).to.equal 1
      expect(pt3.edges[0].largeArc).to.equal 0
      expect(pt3.edges[0].sweep).to.equal 1
      expect(pt4.edges[0].radius).to.equal 1
      expect(pt4.edges[0].largeArc).to.equal 0
      expect(pt4.edges[0].sweep).to.equal 0

    describe 'drawing to an adjacent point', ->

      it 'should return a path lineTo given a line segment', ->
        pt1 = new Point 0, 0
        pt2 = new Point 1, 1
        pt1.addEdgeTo pt2
        result = pt1.drawToAdjacent()
        expect(result).to.eql {
          point: pt2
          path: ['L', 1, 1]
        }

      it 'should return a arcTo given an arc', ->
        pt1 = new Point 0, 0
        pt2 = new Point 1, 1
        pt1.addEdgeTo pt2, radius = 1, largeArc = 0, sweep = 0
        result = pt1.drawToAdjacent()
        expect(result).to.eql {
          point: pt2
          path: ['A', 1, 1, 0, 0, 0, 1, 1]
        }

      it 'should remove both points from the adjacent arrays', ->
        pt1 = new Point 0, 0
        pt2 = new Point 1, 1
        pt3 = new Point 2, 2
        pt1.addEdgeTo pt2
        pt2.addEdgeTo pt3
        expect(pt1.edges).to.have.length 1
        expect(pt2.edges).to.have.length 2
        pt1.drawToAdjacent()
        expect(pt1.edges).to.be.empty
        expect(pt2.edges).to.have.length 1

      it 'should not remove points that still have an edge', ->
        # two points that are connected by two arcs (full circle)
        pt0 = new Point 0, 0
        pt1 = new Point 1, 1
        pt0.addEdgeTo pt1, 1, 0, 0
        pt1.addEdgeTo pt0, 1, 0, 0
        expect(pt0.edges).to.have.length 2
        expect(pt1.edges).to.have.length 2
        pt0.drawToAdjacent()
        expect(pt0.edges).to.have.length 1
        expect(pt1.edges).to.have.length 1

  describe 'gatherPoints function', ->
    result = null
    beforeEach ->
      result = gatherPoints [
        'M', 0, 0, 'L', 1, 1, 'M', 2, 2, 'A', 1, 1, 0, 0, 0, 1, 1
      ]

    it 'should return an array', ->
      expect(result).to.be.an.instanceOf Array

    it 'should create an array with the correct number of points', ->
      expect(find result, {x: 0, y: 0}).to.exist
      expect(find result, {x: 1, y: 1}).to.exist
      expect(find result, {x: 2, y: 2}).to.exist
      expect(result).to.have.length 3

    it 'should set adjacency correctly', ->
      pt0 = find result, {x: 0, y: 0}
      pt1 = find result, {x: 1, y: 1}
      pt2 = find result, {x: 2, y: 2}
      expect(pt0.edges[0]).to.eql {point: pt1}
      expect(pt2.edges[0]).to.eql {
        point: pt1, radius: 1, largeArc: 0, sweep: 0
      }
      expect(pt1.edges).to.have.length 2
      expect(find pt1.edges, {point: pt0}).to.exist
      expect(find pt1.edges, {point: pt2}).to.eql {
        point: pt2, radius: 1, largeArc: 0, sweep: 1
      }

    it 'should handle a closePath correctly', ->
      result = gatherPoints [
        'M', 0, 0, 'L', 1, 0, 'L', 1, 1, 'Z',
        'M', 2, 2, 'L', 3, 2, 'L', 3, 3, 'Z'
      ]
      pt0 = find result, {x: 0, y: 0}
      pt1 = find result, {x: 1, y: 1}
      pt2 = find result, {x: 2, y: 2}
      pt3 = find result, {x: 3, y: 3}
      expect(result).to.have.length 6
      expect(find pt0.edges, {point: pt1}).to.exist
      expect(find pt1.edges, {point: pt0}).to.exist
      expect(find pt2.edges, {point: pt3}).to.exist
      expect(find pt3.edges, {point: pt2}).to.exist

  describe 'traverse points function', ->

    it 'should return an array', ->
      result = traversePoints()
      expect(result).to.be.an.instanceOf Array

    it 'should reorder points to be adjacent', ->
      points = gatherPoints [
        'M', 0, 0, 'L', 1, 0, 'M', 1, 1, 'L', 1, 0, 'M', 0, 0, 'L', 1, 1
      ]
      result = traversePoints points
      expect(result).to.eql ['M', 0, 0, 'L', 1, 1, 'L', 1, 0, 'Z']

    it 'should work with arcs', ->
      points = gatherPoints [
        'M', 0, 0, 'A', 1, 1, 0, 0, 1, 1, 1, 'M', 0, 0, 'A', 1, 1, 0, 0, 0, 1, 1
      ]
      result = traversePoints points
      expect(result).to.eql [
        'M', 0, 0, 'A', 1, 1, 0, 0, 0, 1, 1, 'A', 1, 1, 0, 0, 0, 0, 0
      ]
