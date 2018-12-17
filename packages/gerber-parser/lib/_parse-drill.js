// parse drill function
// takes a parser transform stream and a block string
'use strict'

var numIsFinite = require('lodash.isfinite')

var commands = require('./_commands')
var drillMode = require('./_drill-mode')
var normalize = require('./normalize-coord')
var parseCoord = require('./parse-coord')

var RE_ALTIUM_HINT = /;FILE_FORMAT=(\d):(\d)/
var RE_KI_HINT = /;FORMAT={(.):(.)\/ (absolute|.+)? \/ (metric|inch) \/.+(trailing|leading|decimal|keep)/

var RE_UNITS = /(INCH|METRIC|M71|M72)(?:,([TL])Z)?/
var RE_TOOL_DEF = /T0*(\d+)[\S]*C([\d.]+)/
var RE_TOOL_SET = /T0*(\d+)(?![\S]*C)/
var RE_COORD = /((?:[XYIJA][+-]?[\d.]+){1,4})(?:G85((?:[XY][+-]?[\d.]+){1,2}))?/
var RE_ROUTE = /^G0([01235])/

var setUnits = function(parser, units, line) {
  var format = units === 'in' ? [2, 4] : [3, 3]
  if (!parser.format.places) {
    parser.format.places = format
  }
  return parser._push(commands.set('units', units, line))
}

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
  }

  return result
}

var zeroFromSupression = function(suppression) {
  if (suppression === 'T') {
    return 'L'
  } else if (suppression === 'L') {
    return 'T'
  }
}

var parseUnits = function(parser, block, line) {
  var unitsMatch = block.match(RE_UNITS)
  var units = unitsMatch[1]
  var suppression = unitsMatch[2]

  if (units === 'METRIC' || units === 'M71') {
    setUnits(parser, 'mm', line)
  } else {
    setUnits(parser, 'in', line)
  }

  if (parser.format.zero == null) {
    parser.format.zero = zeroFromSupression(suppression)
  }
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

    return coordToCommand(parser, block, line)
  }

  if (block === 'M00' || block === 'M30') {
    return parser._push(commands.done(line))
  }

  if (block === 'M71') {
    return setUnits(parser, 'mm', line)
  }

  if (block === 'M72') {
    return setUnits(parser, 'in', line)
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
  if (parser._drillStash.length) {
    parser._drillStash.forEach(function(data) {
      if (!parser.format.zero && RE_COORD.test(data.block)) {
        parser.format.zero = 'T'
        parser._warn(
          'zero suppression missing and not detectable;' +
            ' assuming trailing suppression'
        )
      }
      parseBlock(parser, data.block, data.line)
    })
    parser._drillStash = []
  }
}

var parse = function(parser, block) {
  parser._drillStash = parser._drillStash || []

  // parse comments for formatting hints and ignore the rest
  if (block[0] === ';') {
    // check for kicad format hints
    var formatHints = parseCommentForFormatHints(parser, block, parser.line)

    Object.keys(formatHints).forEach(function(key) {
      if (!parser.format[key]) {
        parser.format[key] = formatHints[key]
      }
    })

    return
  }

  // detect or assume zero suppression
  if (!parser.format.zero) {
    if (parser._drillStash.length >= 1000) {
      flush(parser)
      return parseBlock(parser, block, parser.line)
    }
    if (RE_COORD.test(block)) {
      parser.format.zero = parseCoord.detectZero(block)
      if (parser.format.zero) {
        var zero = parser.format.zero === 'L' ? 'leading' : 'trailing'
        parser._warn(
          'zero suppression missing; detected ' + zero + ' suppression'
        )
        flush(parser)
        return parseBlock(parser, block, parser.line)
      }
    } else if (RE_UNITS.test(block)) {
      var unitsMatch = block.match(RE_UNITS)
      var suppression = unitsMatch[2]
      parser.format.zero = zeroFromSupression(suppression)
      if (parser.format.zero) {
        flush(parser)
        return parseBlock(parser, block, parser.line)
      }
    }

    return parser._drillStash.push({line: parser.line, block: block})
  }

  return parseBlock(parser, block, parser.line)
}

module.exports = {parse: parse, flush: flush}
