// test suite for gerber-to-svg
'use strict'

var events = require('events')
var proxyquire = require('proxyquire')
var assign = require('lodash/assign')
var xmlElementString = require('xml-element-string')
var sinon = require('sinon')
var chai = require('chai')
var sinonChai = require('sinon-chai')
var expect = chai.expect

chai.use(sinonChai)

var parserStub = sinon.stub()
var plotterStub = sinon.stub()
var converterStub = sinon.stub()
var xmlElementSpy = sinon.spy(xmlElementString)
var gerberToSvg = proxyquire('../lib/gerber-to-svg', {
  'gerber-parser': parserStub,
  'gerber-plotter': plotterStub,
  'xml-element-string': xmlElementSpy,
  './plotter-to-svg': converterStub,
})

var render = require('../lib/render')
var clone = require('../lib/clone')

describe('gerber to svg', function() {
  var fakeParser
  var fakePlotter
  var fakeConverter

  beforeEach(function() {
    parserStub.reset()
    plotterStub.reset()
    converterStub.reset()

    fakeParser = new events.EventEmitter()
    assign(fakeParser, {
      pipe: sinon.stub().returnsArg(0),
      write: sinon.spy(),
      end: sinon.spy(),
    })
    fakePlotter = new events.EventEmitter()
    assign(fakePlotter, {
      pipe: sinon.stub().returnsArg(0),
      write: sinon.spy(),
    })
    fakeConverter = new events.EventEmitter()
    assign(fakeConverter, {
      pipe: sinon.stub().returnsArg(0),
      read: sinon.stub(),
      write: sinon.spy(),
    })

    parserStub.returns(fakeParser)
    plotterStub.returns(fakePlotter)
    converterStub.returns(fakeConverter)
  })

  afterEach(function() {
    fakeParser.removeAllListeners()
    fakePlotter.removeAllListeners()
    fakeConverter.removeAllListeners()
  })

  it('should return a the converter transform stream', function() {
    var converter1 = gerberToSvg('', 'test-id')
    var converter2 = gerberToSvg('', 'test-id', function() {})

    expect(converter1).to.equal(fakeConverter)
    expect(converter2).to.equal(fakeConverter)

    expect(converterStub.alwaysCalledWithNew()).to.equal(true)
    expect(converterStub).to.have.callCount(2)
  })

  it('should gather readable data from the converter in callback mode', function(done) {
    gerberToSvg('foobar*\n', 'quz', function(error, result) {
      expect(error == null).to.equal(true)
      expect(result).to.equal('<svg><foo/><bar/></svg>')
      done()
    })

    fakeConverter.read.onCall(0).returns('<svg>')
    fakeConverter.read.onCall(1).returns('<foo/>')
    fakeConverter.read.onCall(2).returns(null)
    fakeConverter.emit('readable')
    fakeConverter.read.onCall(3).returns('<bar/>')
    fakeConverter.read.onCall(4).returns('</svg>')
    fakeConverter.read.onCall(5).returns(null)
    fakeConverter.emit('readable')

    fakeConverter.emit('end')
  })

  it('should pipe a stream input into the parser and listen for errors', function() {
    var input = {pipe: sinon.spy(), setEncoding: sinon.spy()}

    gerberToSvg(input, 'test-id')
    expect(input.pipe).to.be.calledWith(fakeParser)
    expect(fakeParser.pipe).to.be.calledWith(fakePlotter)
    expect(fakePlotter.pipe).to.be.calledWith(fakeConverter)
    expect(input.setEncoding).to.be.calledWith('utf8')
  })

  it('should write string input into the parser', function(done) {
    var input = 'G04 empty gerber*\nM02*\n'

    gerberToSvg(input, 'test-id')

    setTimeout(function() {
      expect(fakeParser.write).to.be.calledWith(input)
      expect(fakeParser.end).to.have.callCount(1)
      done()
    }, 10)
  })

  it('should pass the id to plotter-to-svg when it is a string', function() {
    gerberToSvg('', 'foo')
    expect(converterStub).to.be.calledWith({id: 'foo'})
  })

  it('should pass the id in an object', function() {
    gerberToSvg('', {id: 'bar'})
    expect(converterStub).to.be.calledWith({id: 'bar'})
  })

  it('should throw an error if id is missing', function() {
    expect(function() {
      gerberToSvg('', {})
    }).to.throw(/id required/)
    expect(function() {
      gerberToSvg('')
    }).to.throw(/id required/)
  })

  it('should pass the attributes option', function() {
    gerberToSvg('', {id: 'foo', attributes: {bar: 'baz'}})
    expect(converterStub).to.be.calledWith({id: 'foo', bar: 'baz'})
  })

  it('should pass createElement, which should default to xml-element-string', function() {
    var element = function() {}

    gerberToSvg('', {id: 'foo'})
    expect(converterStub).to.be.calledWith({id: 'foo'}, xmlElementSpy)
    gerberToSvg('', {id: 'bar', createElement: element})
    expect(converterStub).to.be.calledWith({id: 'bar'}, element)
  })

  it('should pass includeNamespace, which should default true', function() {
    var element = function() {}

    gerberToSvg('', {id: 'foo', createElement: element})
    expect(converterStub).to.be.calledWith({id: 'foo'}, element, true)
    gerberToSvg('', {
      id: 'bar',
      createElement: element,
      includeNamespace: false,
    })
    expect(converterStub).to.be.calledWith({id: 'bar'}, element, false)
  })

  it('should pass objectMode, which should default to false', function() {
    var element = function() {}

    gerberToSvg('', {id: 'foo', createElement: element})
    expect(converterStub).to.be.calledWith({id: 'foo'}, element, true, false)
    gerberToSvg('', {id: 'bar', createElement: element, objectMode: true})
    expect(converterStub).to.be.calledWith({id: 'bar'}, element, true, true)
  })

  describe('passing along warnings', function() {
    it('should emit warnings from the parser', function(done) {
      var converter = gerberToSvg('foobar*\n', 'foobar')
      var warning = {}

      converter.once('warning', function(w) {
        expect(w).to.equal(warning)
        done()
      })
      fakeParser.emit('warning', warning)
    })

    it('should emit warnings from the plotter', function(done) {
      var converter = gerberToSvg('foobar*\n', 'foobar')
      var warning = {}

      converter.once('warning', function(w) {
        expect(w).to.equal(warning)
        done()
      })
      fakePlotter.emit('warning', warning)
    })
  })

  describe('passing along errors', function() {
    it('should emit errors from the parser', function(done) {
      var converter = gerberToSvg('foobar*\n', 'foobar')
      var error = {}

      converter.once('error', function(e) {
        expect(e).to.equal(error)
        done()
      })
      fakeParser.emit('error', error)
    })

    it('should emit errors from the plotter', function(done) {
      var converter = gerberToSvg('foobar*\n', 'foobar')
      var error = {}

      converter.once('error', function(e) {
        expect(e).to.equal(error)
        done()
      })
      fakePlotter.emit('error', error)
    })

    it('should return errors from the parser in callback mode', function(done) {
      var expectedError = {}

      gerberToSvg('foobar*\n', 'foobar', function(error) {
        expect(error).to.equal(expectedError)
        done()
      })

      fakeParser.emit('error', expectedError)
    })

    it('should return errors from the plotter in callback mode', function(done) {
      var expectedError = {}

      gerberToSvg('foobar*\n', 'foobar', function(error) {
        expect(error).to.equal(expectedError)
        done()
      })

      fakePlotter.emit('error', expectedError)
    })
  })

  it('should take the filetype format from the parser', function() {
    var parser = new events.EventEmitter()

    assign(parser, fakeParser, {format: {filetype: 'foobar'}})
    parserStub.returns(parser)

    var converter = gerberToSvg('G04 a gerber file*\n', 'gbr')

    expect(converter.filetype == null).to.equal(true)

    parser.emit('end')
    expect(converter.filetype).to.equal('foobar')
  })

  it('should expose the render function used by the converter', function() {
    var fakeConverter = {
      defs: ['the'],
      layer: ['other'],
      viewBox: [0, 1, 2, 3],
      width: 'I',
      height: 'must',
      units: 'have',
    }
    var expected = render(fakeConverter)

    expect(String(gerberToSvg.render)).to.equal(String(render))
    expect(gerberToSvg.render(fakeConverter)).to.equal(expected)
  })

  it('shoud have a clone method that clones public properties of a converter', function() {
    var converter = {
      parser: 'hello',
      plotter: 'from',
      defs: 'the',
      layer: 'other',
      viewBox: 'side',
      width: 'I',
      height: 'must',
      units: 'have',
      _foo: 'called',
      _bar: 'a',
      _baz: 'thousand',
      _qux: 'times',
    }

    expect(String(gerberToSvg.clone)).to.equal(String(clone))
    expect(gerberToSvg.clone(converter)).to.eql({
      defs: 'the',
      layer: 'other',
      viewBox: 'side',
      width: 'I',
      height: 'must',
      units: 'have',
    })
  })

  describe('parser and plotter options', function() {
    it('should pass parser options to the parser', function() {
      var options = {
        id: 'bar',
        places: [2, 3],
        zero: 'T',
        filetype: 'drill',
      }

      gerberToSvg('foo*\n', options)
      expect(parserStub).to.be.calledWith({
        places: [2, 3],
        zero: 'T',
        filetype: 'drill',
      })
    })

    it('should pass plotter options to the plotter', function() {
      var options = {
        id: 'bar',
        units: 'in',
        backupUnits: 'mm',
        nota: 'A',
        backupNota: 'I',
        optimizePaths: true,
        plotAsOutline: false,
      }

      gerberToSvg('foo*\n', options)
      expect(plotterStub).to.be.calledWith({
        units: 'in',
        backupUnits: 'mm',
        nota: 'A',
        backupNota: 'I',
        optimizePaths: true,
        plotAsOutline: false,
      })
    })

    it('should include the parser and plotter as properties', function() {
      var result = gerberToSvg('thing', 'id')

      expect(result.parser).to.equal(fakeParser)
      expect(result.plotter).to.equal(fakePlotter)
    })
  })
})
