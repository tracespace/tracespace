// parse gerber function
// takes a parser transform stream and a block string
'use strict'

var commands = require('./_commands')
var normalize = require('./normalize-coord')
var parseCoord = require('./parse-coord')
var parseMacroBlock = require('./_parse-macro-block')

// g-code set matchers
var RE_MODE = /^G0*([123])/
var RE_REGION = /^G3([67])/
var RE_ARC = /^G7([45])/
var RE_BKP_UNITS = /^G7([01])/
var RE_BKP_NOTA = /^G9([01])/
var RE_COMMENT = /^G0*4/

// object attributes (TO)
var RE_TO = /^%TO[^%*]*/

// tool changes
var RE_TOOL = /^(?:G54)?D0*([1-9]\d+)/

// operations
var RE_OP = /D0*([123])$/
var RE_COORD = /^(?:G0*[123])?((?:[XYIJ][+-]?\d+){1,4})(?:D0*[123])?$/

// parameter code matchers
var RE_UNITS = /^%MO(IN|MM)/
// format spec regexp courtesy @summivox
var RE_FORMAT = /^%FS([LT]?)([AI]?)(.*)X([0-7])([0-7])Y\4\5/
var RE_POLARITY = /^%LP([CD])/
var RE_STEP_REP = /^%SR(?:X(\d+)Y(\d+)I([\d.]+)J([\d.]+))?/
var RE_TOOL_DEF = /^%ADD0*(\d{2,})([A-Za-z_$][\w\-.]*)(?:,((?:X?[\d.-]+)*))?/
var RE_MACRO = /^%AM([A-Za-z_$][\w\-.]*)\*?(.*)/

// Special Case: Cadence Allegro
// The gerber spec says
//   "There can be only one extended code command between each pair of ‘%’ delimiters"
// Cadence Allegro violates this rule by including the units after the format command
//
// Sample:
//   G04 File Origin:  Cadence Allegro 17.2-S032*
//   ...
//   %FSLAX25Y25*MOMM*%
//   ...
//
var RE_CADENCE_ALLEGRO_UNITS_IN_FORMAT = /\*MO(IN|MM)$/

var parseUnits = function(parser, unitsMatch) {
  var units = unitsMatch === 'IN' ? 'in' : 'mm'
  return parser._push(commands.set('units', units))
}

var parseToolDef = function(parser, block) {
  var format = {places: parser.format.places}
  var toolMatch = block.match(RE_TOOL_DEF)
  var tool = toolMatch[1]
  var shapeMatch = toolMatch[2]
  var toolArgs = toolMatch[3] ? toolMatch[3].split('X') : []

  // get the shape
  var shape
  var maxArgs
  if (shapeMatch === 'C') {
    shape = 'circle'
    maxArgs = 3
  } else if (shapeMatch === 'R') {
    shape = 'rect'
    maxArgs = 4
  } else if (shapeMatch === 'O') {
    shape = 'obround'
    maxArgs = 4
  } else if (shapeMatch === 'P') {
    shape = 'poly'
    maxArgs = 5
  } else {
    shape = shapeMatch
    maxArgs = 0
  }

  var val
  if (shape === 'circle') {
    val = [normalize(toolArgs[0], format)]
  } else if (shape === 'rect' || shape === 'obround') {
    val = [normalize(toolArgs[0], format), normalize(toolArgs[1], format)]
  } else if (shape === 'poly') {
    val = [normalize(toolArgs[0], format), Number(toolArgs[1]), 0]
    if (toolArgs[2]) {
      val[2] = Number(toolArgs[2])
    }
  } else {
    val = toolArgs.map(Number)
  }

  var hole = []
  if (toolArgs[maxArgs - 1]) {
    hole = [
      normalize(toolArgs[maxArgs - 2], format),
      normalize(toolArgs[maxArgs - 1], format),
    ]
  } else if (toolArgs[maxArgs - 2]) {
    hole = [normalize(toolArgs[maxArgs - 2], format)]
  }
  var toolDef = {shape: shape, params: val, hole: hole}
  return parser._push(commands.tool(tool, toolDef))
}

var parseMacroDef = function(parser, block) {
  var macroMatch = block.match(RE_MACRO)
  var name = macroMatch[1]
  if (name.match(/-/)) {
    parser._warn('hyphens in macro name are illegal: ' + name)
  }
  var blockMatch = macroMatch[2].length ? macroMatch[2].split('*') : []
  var blocks = blockMatch.filter(Boolean).map(function(block) {
    return parseMacroBlock(parser, block)
  })

  return parser._push(commands.macro(name, blocks))
}

var parse = function(parser, block) {
  // if comment or object attribute return
  if (RE_COMMENT.test(block) || RE_TO.test(block)) {
    return
  }

  if (block === 'M02') {
    return parser._push(commands.done())
  }

  if (RE_REGION.test(block)) {
    var regionMatch = block.match(RE_REGION)[1]
    var region = regionMatch === '6'
    return parser._push(commands.set('region', region))
  }

  if (RE_ARC.test(block)) {
    var arcMatch = block.match(RE_ARC)[1]
    var arc = arcMatch === '4' ? 's' : 'm'
    return parser._push(commands.set('arc', arc))
  }

  if (RE_UNITS.test(block)) {
    var unitsMatch = block.match(RE_UNITS)[1]
    return parseUnits(parser, unitsMatch)
  }

  if (RE_BKP_UNITS.test(block)) {
    var bkpUnitsMatch = block.match(RE_BKP_UNITS)[1]
    var backupUnits = bkpUnitsMatch === '0' ? 'in' : 'mm'
    return parser._push(commands.set('backupUnits', backupUnits))
  }

  if (RE_FORMAT.test(block)) {
    var formatMatch = block.match(RE_FORMAT)
    var zero = formatMatch[1]
    var nota = formatMatch[2]
    var unknown = formatMatch[3]
    var leading = Number(formatMatch[4])
    var trailing = Number(formatMatch[5])
    var format = parser.format

    format.zero = format.zero || zero
    if (!format.places) {
      format.places = [leading, trailing]
    }

    // warn if zero suppression missing or set to trailing
    if (!format.zero) {
      format.zero = 'L'
      parser._warn('zero suppression missing from format; assuming leading')
    } else if (format.zero === 'T') {
      parser._warn('trailing zero suppression has been deprecated')
    }

    // warn if there were unknown characters in the format spec
    if (unknown) {
      parser._warn(
        'unknown characters "' + unknown + '" in "' + block + '" were ignored'
      )
    }

    var epsilon = 1.5 * Math.pow(10, -format.places[1])
    parser._push(commands.set('nota', nota))
    parser._push(commands.set('epsilon', epsilon))

    if (RE_CADENCE_ALLEGRO_UNITS_IN_FORMAT.test(block)) {
      var caUnitsMatch = block.match(RE_CADENCE_ALLEGRO_UNITS_IN_FORMAT)[1]
      parseUnits(parser, caUnitsMatch)
    }

    return
  }

  if (RE_BKP_NOTA.test(block)) {
    var bkpNotaMatch = block.match(RE_BKP_NOTA)[1]
    var backupNota = bkpNotaMatch === '0' ? 'A' : 'I'
    return parser._push(commands.set('backupNota', backupNota))
  }

  if (RE_POLARITY.test(block)) {
    var polarity = block.match(RE_POLARITY)[1]
    return parser._push(commands.level('polarity', polarity))
  }

  if (RE_STEP_REP.test(block)) {
    var stepRepeatMatch = block.match(RE_STEP_REP)
    var x = stepRepeatMatch[1] || 1
    var y = stepRepeatMatch[2] || 1
    var i = stepRepeatMatch[3] || 0
    var j = stepRepeatMatch[4] || 0
    var sr = {x: Number(x), y: Number(y), i: Number(i), j: Number(j)}
    return parser._push(commands.level('stepRep', sr))
  }

  if (RE_TOOL.test(block)) {
    var tool = block.match(RE_TOOL)[1]
    return parser._push(commands.set('tool', tool))
  }

  if (RE_TOOL_DEF.test(block)) {
    return parseToolDef(parser, block)
  }

  if (RE_MACRO.test(block)) {
    return parseMacroDef(parser, block)
  }

  // finally, look for mode commands and operations
  // they may appear in the same block
  if (RE_OP.test(block) || RE_MODE.test(block) || RE_COORD.test(block)) {
    var opMatch = block.match(RE_OP)
    var modeMatch = block.match(RE_MODE)
    var coordMatch = block.match(RE_COORD)
    var mode

    if (modeMatch) {
      if (modeMatch[1] === '1') {
        mode = 'i'
      } else if (modeMatch[1] === '2') {
        mode = 'cw'
      } else {
        mode = 'ccw'
      }

      parser._push(commands.set('mode', mode))
    }

    if (opMatch || coordMatch) {
      var opCode = opMatch ? opMatch[1] : ''
      var coordString = coordMatch ? coordMatch[1] : ''
      var coord = parseCoord.parse(coordString, parser.format)

      var op = 'last'
      if (opCode === '1') {
        op = 'int'
      } else if (opCode === '2') {
        op = 'move'
      } else if (opCode === '3') {
        op = 'flash'
      }

      parser._push(commands.op(op, coord))
    }

    return
  }

  // if we reach here the block was unhandled, so warn if it is not empty
  return parser._warn(
    'block "' + block + '" was not recognized and was ignored'
  )
}

module.exports = parse
