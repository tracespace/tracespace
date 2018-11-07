// tests for function that gets the next block from a chunk
'use strict'

var expect = require('chai').expect
var partial = require('lodash/partial')
var getNextBlock = require('../lib/get-next-block')

describe('get next block', function() {
  it('should throw with a bad filetype', function() {
    var bad = function() {
      getNextBlock('foo', '', 0)
    }
    expect(bad).to.throw(/filetype/)
  })

  describe('from gerber files', function() {
    var getNext = partial(getNextBlock, 'gerber')

    it('should split at *', function() {
      var chunk = 'M02*'
      var result = getNext(chunk, 0)

      expect(result.block).to.equal('M02')
    })

    it('should return characters read', function() {
      var chunk = 'G01*G02*G03*'
      var res1 = getNext(chunk, 0)
      var res2 = getNext(chunk, 4)
      var res3 = getNext(chunk, 8)

      expect(res1.block).to.equal('G01')
      expect(res2.block).to.equal('G02')
      expect(res3.block).to.equal('G03')
      expect(res1.read).to.equal(4)
      expect(res2.read).to.equal(4)
      expect(res3.read).to.equal(4)
    })

    it('should return newlines read', function() {
      var chunk = 'G01*\nG02*\nG03*\n'
      var res1 = getNext(chunk, 0)
      var res2 = getNext(chunk, 4)
      var res3 = getNext(chunk, 9)

      expect(res1.block).to.equal('G01')
      expect(res2.block).to.equal('G02')
      expect(res3.block).to.equal('G03')
      expect(res1.read).to.equal(4)
      expect(res2.read).to.equal(5)
      expect(res3.read).to.equal(5)
      expect(res1.lines).to.equal(0)
      expect(res2.lines).to.equal(1)
      expect(res3.lines).to.equal(1)
    })

    it('should skip the end percent of a param', function() {
      var chunk = '%FSLAX24Y24*%\n%MOIN*%\n'
      var res1 = getNext(chunk, 0)
      var res2 = getNext(chunk, 13)

      expect(res1.block).to.equal('%FSLAX24Y24')
      expect(res2.block).to.equal('%MOIN')
      expect(res1.read).to.equal(13)
      expect(res2.read).to.equal(8)
      expect(res1.lines).to.equal(0)
      expect(res2.lines).to.equal(1)
    })

    it('should trim whitespace between blocks', function() {
      var chunk = 'G04 hello*  \n%FSLAX24Y24*%\n'
      var res1 = getNext(chunk, 0)
      var res2 = getNext(chunk, res1.read)

      expect(res1.block).to.equal('G04 hello')
      expect(res2.block).to.equal('%FSLAX24Y24')
      expect(res1.read).to.equal(10)
      expect(res2.read).to.equal(16)
      expect(res1.lines).to.equal(0)
      expect(res2.lines).to.equal(1)
    })
  })

  describe('from drill files', function() {
    var getNext = partial(getNextBlock, 'drill')

    it('should split at newlines', function() {
      var chunk = 'G90\nG05\nM72\nM30\n'
      var res1 = getNext(chunk, 0)
      var res2 = getNext(chunk, 4)
      var res3 = getNext(chunk, 8)
      var res4 = getNext(chunk, 12)

      expect(res1.block).to.equal('G90')
      expect(res2.block).to.equal('G05')
      expect(res3.block).to.equal('M72')
      expect(res4.block).to.equal('M30')
      expect(res1.read).to.equal(4)
      expect(res2.read).to.equal(4)
      expect(res3.read).to.equal(4)
      expect(res4.read).to.equal(4)
      expect(res1.lines).to.equal(1)
      expect(res2.lines).to.equal(1)
      expect(res3.lines).to.equal(1)
      expect(res4.lines).to.equal(1)
    })
  })
})
