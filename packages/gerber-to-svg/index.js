// gerber to svg transform stream
'use strict'

var xid = require('@tracespace/xml-id')
var gerberParser = require('gerber-parser')
var gerberPlotter = require('gerber-plotter')
var xmlElementString = require('xml-element-string')

var PlotterToSvg = require('./lib/plotter-to-svg')
var render = require('./render')
var clone = require('./clone')

var parseOptions = function(options) {
  if (typeof options === 'string') {
    options = {id: options}
  } else if (!options) {
    options = {}
  }

  var opts = {
    id: xid.ensure(options.id),
    attributes: options.attributes || {},
    createElement: options.createElement || xmlElementString,
    objectMode: options.objectMode == null ? false : options.objectMode,
    parser: {
      places: options.places,
      zero: options.zero,
      filetype: options.filetype,
    },
    plotter: {
      units: options.units,
      backupUnits: options.backupUnits,
      nota: options.nota,
      backupNota: options.backupNota,
      optimizePaths: options.optimizePaths,
      plotAsOutline: options.plotAsOutline,
    },
  }

  return opts
}

module.exports = function gerberConverterFactory(gerber, inputOpts, done) {
  if (typeof inputOpts === 'function') {
    done = inputOpts
    inputOpts = null
  }

  var opts = parseOptions(inputOpts)
  var callbackMode = done != null

  var converter = new PlotterToSvg(
    opts.id,
    opts.attributes,
    opts.createElement,
    opts.objectMode
  )

  var parser = gerberParser(opts.parser)
  var plotter = gerberPlotter(opts.plotter)

  converter.parser = parser
  converter.plotter = plotter

  parser.on('warning', function handleParserWarning(w) {
    converter.emit('warning', w)
  })
  plotter.on('warning', function handlePlotterWarning(w) {
    converter.emit('warning', w)
  })
  parser.once('error', function handleParserError(e) {
    converter.emit('error', e)
  })
  plotter.once('error', function handlePlotterError(e) {
    converter.emit('error', e)
  })

  // expose the filetype property of the parser for convenience
  parser.once('end', function() {
    converter.filetype = parser.format.filetype
  })

  if (gerber.pipe) {
    gerber.setEncoding('utf8')
    gerber.pipe(parser)
  } else {
    // write the gerber string after listeners have been attached etc
    process.nextTick(function writeStringToParser() {
      parser.write(gerber)
      parser.end()
    })
  }

  parser.pipe(plotter).pipe(converter)

  // collect result in callback mode
  if (callbackMode) {
    var result = ''

    var finishConversion = function() {
      return done(null, result)
    }

    converter.on('readable', function collectStreamData() {
      var data

      do {
        data = converter.read() || ''
        result += data
      } while (data)
    })

    converter.once('end', finishConversion)

    converter.once('error', function(error) {
      converter.removeListener('end', finishConversion)

      return done(error)
    })
  }

  return converter
}

module.exports.render = render
module.exports.clone = clone
