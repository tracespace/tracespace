// tests for view-box helper functions
'use strict'

var chai = require('chai')
var sinon = require('sinon')
var sinonChai = require('sinon-chai')
var xmlElementString = require('xml-element-string')
var expect = chai.expect

chai.use(sinonChai)

var box = require('../lib/view-box')

describe('view box helper functions', function() {
  it('should be able to create a new empty viewbox', function() {
    var result = box.new()

    expect(result).to.eql([])
  })

  it('should be able to add two viewboxes', function() {
    var viewBox1 = [0, -1, 4, 5]
    var viewBox2 = [-3, 1, 2, 6]
    var result = box.add(viewBox1, viewBox2)

    expect(result).to.eql([-3, -1, 7, 8])
  })

  it('should be able to add a scaled value', function() {
    var viewBox1 = [0, -1, 4, 5]
    var viewBox2 = [-1.5, 0.5, 1, 3]
    var result = box.addScaled(viewBox1, viewBox2, 2)

    expect(result).to.eql([-3, -1, 7, 8])
  })

  it('should be able to generate an SVG rectangle a classname', function() {
    var viewBox = [0, -1, 4, 5]
    var element = sinon.spy(xmlElementString)
    var result = box.rect(element, viewBox, 'foo')
    var expected = {x: 0, y: -1, width: 4, height: 5, class: 'foo'}

    expect(element).to.be.calledWith('rect', expected)
    expect(result).to.equal(element.returnValues[0])
  })

  it('should be able to generate an SVG rectangle with a fill', function() {
    var viewBox = [0, -1, 4, 5]
    var element = sinon.spy(xmlElementString)
    var result = box.rect(element, viewBox, '', '#fff')
    var expected = {x: 0, y: -1, width: 4, height: 5, fill: '#fff'}

    expect(element).to.be.calledWith('rect', expected)
    expect(result).to.equal(element.returnValues[0])
  })

  it('should output a 0 size rectangle if the array has no length', function() {
    var viewBox = []
    var element = sinon.spy(xmlElementString)
    var result = box.rect(element, viewBox, '', '#fff')
    var expected = {x: 0, y: 0, width: 0, height: 0, fill: '#fff'}

    expect(element).to.be.calledWith('rect', expected)
    expect(result).to.equal(element.returnValues[0])
  })
})
