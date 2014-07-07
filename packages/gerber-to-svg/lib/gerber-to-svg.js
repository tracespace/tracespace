// gerber to svg transform stream
'use strict'

var isString = require('lodash.isstring')
var gerberParser = require('gerber-parser')
var gerberPlotter = require('gerber-plotter')

var PlotterToSvg = require('./plotter-to-svg')

var parseOptions = function(options) {
  var optionsIsString = isString(options)
  if (options == null || (!optionsIsString && (options.id == null))) {
    throw new Error('id required for gerber-to-svg')
  }

  if (optionsIsString) {
    return {svg: {id: options.replace('.', '-')}}
  }

  var id = options.id.replace('.', '-')
  var className = options.class
  var color = options.color

  var opts = {
    svg: {
      id: id,
      class: className,
      color: color
    },
    parser: {
      places: options.places,
      zero: options.zero,
      filetype: options.filetype
    },
    plotter: {
      units: options.units,
      backupUnits: options.backupUnits,
      nota: options.nota,
      backupNota: options.backupNota,
      optimizePaths: options.optimizePaths,
      plotAsOutline: options.plotAsOutline
    }
  }

  return opts
}

var gerberToSvg = function(gerber, options, done) {
  var opts = parseOptions(options)
  var callbackMode = (done != null)

  var converter = new PlotterToSvg(opts.svg.id, opts.svg.class, opts.svg.color)
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
    gerber.once('error', function handleStreamError(e) {
      converter.emit('error', e)
    })
    gerber.setEncoding('utf8')
    gerber.pipe(parser)
  }
  else {
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

module.exports = gerberToSvg
