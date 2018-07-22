'use strict'

var expect = require('chai').expect
var xid = require('@tracespace/xml-id')

describe('xml-id', function () {
  describe('sanitize', function () {
    it('leave a xml + url valid id alone', function () {
      expect(xid.sanitize('_123')).to.equal('_123')
      expect(xid.sanitize('aBcDeFg')).to.equal('aBcDeFg')
    })

    it('should replace an invalid start character with an "_"', function () {
      expect(xid.sanitize('0123')).to.equal('_123')
      expect(xid.sanitize('-123')).to.equal('_123')
      expect(xid.sanitize('.123')).to.equal('_123')
      expect(xid.sanitize(':123')).to.equal('_123')
    })

    it('should replace invalid characters with an "_"', function () {
      expect(xid.sanitize('A B C')).to.equal('A_B_C')
      expect(xid.sanitize('A~B~C')).to.equal('A_B_C')
      expect(xid.sanitize('.1*2&3')).to.equal('_1_2_3')
    })
  })
})
