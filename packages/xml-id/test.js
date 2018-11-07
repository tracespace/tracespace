'use strict'

var expect = require('chai').expect
var xid = require('@tracespace/xml-id')

describe('xml-id', function() {
  describe('sanitize', function() {
    var SPECS = [
      // should leave these alone
      {given: '_123', expected: '_123'},
      {given: 'aBcDeFg', expected: 'aBcDeFg'},
      // should sanitize start char
      {given: '0123', expected: '_123'},
      {given: '-123', expected: '_123'},
      {given: '.123', expected: '_123'},
      {given: ':123', expected: '_123'},
      // replace invalid characters with an underscore
      {given: 'A B C', expected: 'A_B_C'},
      {given: 'A~B~C', expected: 'A_B_C'},
      {given: '.1*2&3', expected: '_1_2_3'},
      {given: 'abc.def', expected: 'abc_def'},
    ]

    SPECS.forEach(function(spec) {
      var given = spec.given
      var expected = spec.expected

      it('given ' + given + ' expect ' + expected, function() {
        expect(xid.sanitize(given)).to.equal(expected)
      })
    })
  })
})
