// tests for view-box helper functions
'use strict'

var expect = require('chai').expect

var box = require('../lib/view-box')

describe('view box helper functions', function() {
  it('should be able to create a new empty viewbox', function() {
    var result = box.new()
    expect(result).to.eql([0, 0, 0, 0])
  })

  it('should be able to add two viewboxes', function() {
    var viewBox1 = [0, -1, 4, 5]
    var viewBox2 = [-3, 1, 2, 6]
    var result = box.add(viewBox1, viewBox2)

    expect(result).to.eql([-3, -1, 7, 8])
  })
})
