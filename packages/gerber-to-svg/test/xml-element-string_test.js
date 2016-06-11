// test suite for the xml element string function
'use strict'

var expect = require('chai').expect

var element = require('../lib/xml-element-string')

describe('xml element string function', function() {
  it('should be able to create a node', function() {
    var result = element('node')
    var expected = '<node/>'

    expect(result).to.equal(expected)
  })

  it('should be able to create a node with attributes', function() {
    var result = element('foo', {bar: 'baz', quux: 'hello'})
    var expected = '<foo bar="baz" quux="hello"/>'

    expect(result).to.equal(expected)
  })

  it('should not write null attributes', function() {
    var result = element('foo', {bar: undefined, baz: 'quux'})
    var expected = '<foo baz="quux"/>'

    expect(result).to.equal(expected)
  })

  it('should escape html characters in the attributes', function() {
    var result = element('foo', {bar: '"/>danger'})
    var expected = '<foo bar="&quot;/&gt;danger"/>'

    expect(result).to.equal(expected)
  })

  it('should handle an array of children', function() {
    var result = element('node', {}, ['<child/>', '<child/>'])
    var expected = '<node><child/><child/></node>'

    expect(result).to.equal(expected)
  })
})
