# tests for the board shape function
expect = require('chai').expect
find = require 'lodash.find'
boardShape = require '../src/lib/board-shape'
Point = require '../src/lib/board-shape/point'
gatherPoints = require '../src/lib/board-shape/gather-points'

describe 'client-lib-boardShape', ->

  describe 'Point class', ->
    it 'should take in a location coordinate', ->
      pt = new Point 1, 2
      expect(pt.x).to.equal 1
      expect(pt.y).to.equal 2

    it 'should have an adjacent points array', ->
      pt = new Point()
      expect(pt.adjPoints).exist

    it 'should be able add adjacent points', ->
      pt1 = new Point 0, 0
      pt2 = new Point 1, 1
      pt1.adjacentTo pt2
      expect(pt1.adjPoints[0]).to.have.property 'point', pt2
      expect(pt2.adjPoints[0]).to.have.property 'point', pt1

    it 'should not duplicate adjacent points', ->
      pt1 = new Point 0, 0
      pt2 = new Point 1, 1
      pt1.adjacentTo pt2
      pt2.adjacentTo pt1
      expect(pt1.adjPoints).to.have.length 1
      expect(pt2.adjPoints).to.have.length 1

    it 'should be able to say the edge to an adjacent point is an arc', ->
      pt1 = new Point 0, 0
      pt2 = new Point 1, 1
      pt1.adjacentTo pt2, radius = 1, largeArc = 0, sweep = 0
      expect(pt1.adjPoints[0].radius).to.equal 1
      expect(pt1.adjPoints[0].largeArc).to.equal 0
      expect(pt1.adjPoints[0].sweep).to.equal 0
      expect(pt2.adjPoints[0].radius).to.equal 1
      expect(pt2.adjPoints[0].largeArc).to.equal 0
      expect(pt2.adjPoints[0].sweep).to.equal 1
      pt3 = new Point 0, 0
      pt4 = new Point 1, 1
      pt3.adjacentTo pt4, radius = 1, largeArc = 0, sweep = 1
      expect(pt3.adjPoints[0].radius).to.equal 1
      expect(pt3.adjPoints[0].largeArc).to.equal 0
      expect(pt3.adjPoints[0].sweep).to.equal 1
      expect(pt4.adjPoints[0].radius).to.equal 1
      expect(pt4.adjPoints[0].largeArc).to.equal 0
      expect(pt4.adjPoints[0].sweep).to.equal 0

    describe 'drawing to an adjacent point', ->

      it 'should return a path lineTo given a line segment', ->
        pt1 = new Point 0, 0
        pt2 = new Point 1, 1
        pt1.adjacentTo pt2
        result = pt1.drawToAdjacent()
        expect(result).to.eql ['L', 1, 1]

      it 'should return a arcTo given an arc', ->
        pt1 = new Point 0, 0
        pt2 = new Point 1, 1
        pt1.adjacentTo pt2, radius = 1, largeArc = 0, sweep = 0
        result = pt1.drawToAdjacent()
        expect(result).to.eql ['A', 1, 1, 0, 0, 0, 1, 1]

      it 'should remove both points from the adjacent arrays', ->
        pt1 = new Point 0, 0
        pt2 = new Point 1, 1
        pt3 = new Point 2, 2
        pt1.adjacentTo pt2
        pt2.adjacentTo pt3
        expect(pt1.adjPoints).to.have.length 1
        expect(pt2.adjPoints).to.have.length 2
        pt1.drawToAdjacent()
        expect(pt1.adjPoints).to.be.empty
        expect(pt2.adjPoints).to.have.length 1

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
      expect(pt0.adjPoints[0]).to.eql {point: pt1}
      expect(pt2.adjPoints[0]).to.eql {
        point: pt1, radius: 1, largeArc: 0, sweep: 0
      }
      expect(pt1.adjPoints).to.have.length 2
      expect(find pt1.adjPoints, {point: pt0}).to.exist
      expect(find pt1.adjPoints, {point: pt2}).to.eql {
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
      expect(find pt0.adjPoints, {point: pt1}).to.exist
      expect(find pt1.adjPoints, {point: pt0}).to.exist
      expect(find pt2.adjPoints, {point: pt3}).to.exist
      expect(find pt3.adjPoints, {point: pt2}).to.exist
