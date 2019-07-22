// parse drill function
// takes a parser transform stream and a block string
'use strict'

var numIsFinite = require('lodash.isfinite')

var commands = require('./_commands')
var drillMode = require('./_drill-mode')
var normalize = require('./normalize-coord')
var parseCoord = require('./parse-coord')

var RE_ALTIUM_HINT = /;FILE_FORMAT=(\d):(\d)/
var RE_ALTIUM_PLATING_HINT = /;TYPE=(PLATED|NON_PLATED)/
var RE_KI_HINT = /;FORMAT={(.):(.)\/ (absolute|.+)? \/ (metric|inch) \/.+(trailing|leading|decimal|keep)/

var RE_UNITS = /^(INCH|METRIC|M71|M72)/
var RE_ZERO = /,([TL])Z/
var RE_FORMAT = /,(0{1,8})\.(0{1,8})/
var RE_TOOL_DEF = /T0*(\d+)[\S]*C([\d.]+)/
var RE_TOOL_SET = /T0*(\d+)(?![\S]*C)/
var RE_COORD = /((?:[XYIJA][+-]?[\d.]+){1,4})(?:G85((?:[XY][+-]?[\d.]+){1,2}))?/
var RE_ROUTE = /^G0([01235])/

var parseCommentForFormatHints = function(parser, block, line) {
  var result = {}

  if (RE_KI_HINT.test(block)) {
    var kicadMatch = block.match(RE_KI_HINT)
    var leading = Number(kicadMatch[1])
    var trailing = Number(kicadMatch[2])
    var absolute = kicadMatch[3]
    var unitSet = kicadMatch[4]
    var suppressionSet = kicadMatch[5]

    // set format if we got numbers
    if (numIsFinite(leading) && numIsFinite(trailing)) {
      result.places = [leading, trailing]
    }

    // send backup notation
    if (absolute === 'absolute') {
      parser._push(commands.set('backupNota', 'A', line))
    } else {
      parser._push(commands.set('backupNota', 'I', line))
    }

    // send units
    if (unitSet === 'metric') {
      parser._push(commands.set('backupUnits', 'mm', line))
    } else {
      parser._push(commands.set('backupUnits', 'in', line))
    }

    // set zero suppression
    if (suppressionSet === 'leading' || suppressionSet === 'keep') {
      result.zero = 'L'
    } else if (suppressionSet === 'trailing') {
      result.zero = 'T'
    } else {
      result.zero = 'D'
    }
  } else if (RE_ALTIUM_HINT.test(block)) {
    // check for altium format hints if the format is not already set
    var altiumMatch = block.match(RE_ALTIUM_HINT)

    result.places = [Number(altiumMatch[1]), Number(altiumMatch[2])]
  } else if (RE_ALTIUM_PLATING_HINT.test(block)) {
    var platingMatch = block.match(RE_ALTIUM_PLATING_HINT)
    var holePlating = platingMatch[1] === 'PLATED' ? 'pth' : 'npth'
    parser._push(commands.set('holePlating', holePlating, line))
  }

  return result
}

var parseUnits = function(parser, block, line) {
  var unitsMatch = block.match(RE_UNITS)
  var zeroMatch = block.match(RE_ZERO)
  var formatMatch = block.match(RE_FORMAT)
  var units =
    unitsMatch[1] === 'METRIC' || unitsMatch[1] === 'M71' ? 'mm' : 'in'

  var keep = zeroMatch && zeroMatch[1]

  if (parser.format.zero == null && keep) {
    // flip drill keep to gerber suppression
    parser.format.zero = keep === 'T' ? 'L' : 'T'
  }

  if (parser.format.places == null) {
    if (formatMatch) {
      parser.format.places = [formatMatch[1].length, formatMatch[2].length]
    } else {
      // by default, use 2.4 for inches and 3.3 for mm
      parser.format.places = units === 'in' ? [2, 4] : [3, 3]
    }
  }

  parser._push(commands.set('units', units, line))
}

var coordToCommand = function(parser, block, line) {
  var coordMatch = block.match(RE_COORD)
  var coord = parseCoord.parse(coordMatch[1], parser.format)

  // if there's another match, then it was a slot
  if (coordMatch[2]) {
    parser._push(commands.op('move', coord, line))
    parser._push(commands.set('mode', 'i', line))
    coord = parseCoord.parse(coordMatch[2], parser.format)

    return parser._push(commands.op('int', coord, line))
  }

  // get the drill mode if a route command is present
  if (RE_ROUTE.test(block)) {
    parser._drillMode = block.match(RE_ROUTE)[1]
  }

  switch (parser._drillMode) {
    case drillMode.DRILL:
      return parser._push(commands.op('flash', coord, line))

    case drillMode.MOVE:
      return parser._push(commands.op('move', coord, line))

    case drillMode.LINEAR:
      parser._push(commands.set('mode', 'i', line))
      return parser._push(commands.op('int', coord, line))

    case drillMode.CW_ARC:
      parser._push(commands.set('mode', 'cw', line))
      return parser._push(commands.op('int', coord, line))

    case drillMode.CCW_ARC:
      parser._push(commands.set('mode', 'ccw', line))
      return parser._push(commands.op('int', coord, line))
  }
}

var parseBlock = function(parser, block, line) {
  if (RE_TOOL_DEF.test(block)) {
    var toolMatch = block.match(RE_TOOL_DEF)
    var toolCode = toolMatch[1]
    var toolDia = normalize(toolMatch[2])
    var toolDef = {shape: 'circle', params: [toolDia], hole: []}

    return parser._push(commands.tool(toolCode, toolDef, line))
  }

  // tool set
  if (RE_TOOL_SET.test(block)) {
    var toolSet = block.match(RE_TOOL_SET)[1]

    // allow tool set to fall through because it can happen on the
    // same line as a coordinate operation
    parser._push(commands.set('tool', toolSet, line))
  }

  if (RE_COORD.test(block)) {
    if (!parser.format.places) {
      parser.format.places = [2, 4]
      parser._warn('places format missing; assuming [2, 4]')
    }

    if (!parser.format.zero) {
      parser.format.zero = 'T'
      parser._warn('zero suppression missing; assuming trailing suppression')
    }

    return coordToCommand(parser, block, line)
  }

  if (block === 'M00' || block === 'M30') {
    return parser._push(commands.done(line))
  }

  if (block === 'G90') {
    return parser._push(commands.set('nota', 'A', line))
  }

  if (block === 'G91') {
    return parser._push(commands.set('nota', 'I', line))
  }

  if (RE_UNITS.test(block)) {
    return parseUnits(parser, block, line)
  }
}

var flush = function(parser) {
  parser._drillStash.forEach(function(data) {
    parseBlock(parser, data.block, data.line)
  })
  parser._drillStash = []
}

var parse = function(parser, block) {
  if (block[0] === ';') {
    // if comment, parse it for formatting hints
    var formatHints = parseCommentForFormatHints(parser, block, parser.line)

    Object.keys(formatHints).forEach(function(key) {
      if (!parser.format[key]) {
        parser.format[key] = formatHints[key]
      }
    })
  } else if (!parser.format.zero) {
    // else if we don't have zero suppress yet, attempt to detect it
    parser._drillStash.push({line: parser.line, block: block})

    if (RE_COORD.test(block)) {
      parser.format.zero = parseCoord.detectZero(block)

      if (parser.format.zero) {
        parser._warn(
          'zero suppression missing; detected ' +
            (parser.format.zero === 'L' ? 'leading' : 'trailing') +
            ' suppression'
        )
      }
    }

    if (
      parser.format.zero ||
      RE_ZERO.test(block) ||
      parser._drillStash.length >= 1000
    ) {
      flush(parser)
    }
  } else {
    // else just parse the block like normal
    parseBlock(parser, block, parser.line)
  }
}

module.exports = {parse: parse, flush: flush}
