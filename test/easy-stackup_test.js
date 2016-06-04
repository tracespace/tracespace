// test suite for simpler API
'use strict'

var expect = require('chai').expect

var easyStackup = require('../lib/easy-stackup')

describe('easy-stackup function', function() {
  it('should accept and call node style callback', function(done) {
    easyStackup([], function(error, success) {
      expect(error).to.not.be.ok
      expect(success).to.be.ok
      done()
    })
  })
})
