// gerber-plotter factory
'use strict'

var Plotter = require('./lib/plotter')

var verifyNota = function(nota) {
  if (nota === 'A' || nota === 'I') {
    return nota
  }

  throw new Error('notation must be "in" or "mm"')
}

var verifyUnits = function(units) {
  if (units === 'in' || units === 'mm') {
    return units
  }

  throw new Error('units must be "in" or "mm"')
}

module.exports = function plotterFactory(options) {
  options = options || {}

  var units = options.units ? verifyUnits(options.units) : null
  var backupUnits = options.backupUnits
    ? verifyUnits(options.backupUnits)
    : null

  var nota = options.nota ? verifyNota(options.nota) : null
  var backupNota = options.backupNota ? verifyNota(options.backupNota) : null

  return new Plotter(
    units,
    backupUnits,
    nota,
    backupNota,
    options.optimizePaths,
    options.plotAsOutline
  )
}
