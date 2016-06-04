// test suite for simpler API
'use strict'

var expect = require('chai').expect

var easyStackup = require('../lib/easy-stackup')

describe('easy-stackup function', function() {
  it('should return a promise', function () {
    var result = easyStackup([]);
    expect(result).to.be.an('object');
    expect(result).to.have.property('then');
    expect(result.then).to.be.a('function');
  });
});
