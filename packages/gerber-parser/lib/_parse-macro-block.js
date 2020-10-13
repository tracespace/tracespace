// function to parse a macro block into a primitive object
'use strict'

var parseMacroExpr = require('./_parse-macro-expression')

var RE_NUM = /^-?[\d.]+$/
var RE_VAR_DEF = /^(\$[\d+])=(.+)/

var parseMacroBlock = function(parser, block) {
  // check first for a comment
  if (block[0] === '0') {
    return {type: 'comment'}
  }

  // variable definition
  if (RE_VAR_DEF.test(block)) {
    var varDefMatch = block.match(RE_VAR_DEF)
    var varName = varDefMatch[1]
    var varExpr = varDefMatch[2]
    var evaluate = parseMacroExpr(parser, varExpr)

    var setMods = function(mods) {
      mods[varName] = evaluate(mods)

      return mods
    }
    return {type: 'variable', set: setMods}
  }

  // map a primitive param to a number or, if an expression, a function
  var modVal = function(m) {
    if (RE_NUM.test(m)) {
      return Number(m)
    }
    return parseMacroExpr(parser, m)
  }

  var mods = block.split(',').map(modVal)
  var code = mods[0]
  var exp = mods[1]

  // circle primitive
  if (code === 1) {
    return {
      type: 'circle',
      exp: exp,
      dia: mods[2],
      cx: mods[3],
      cy: mods[4],
      // handle optional rotation with circle primitives
      rot: mods[5] || 0,
    }
  }

  // vector primitive
  if (code === 2) {
    parser._warn('macro aperture vector primitives with code 2 are deprecated')
  }

  if (code === 2 || code === 20) {
    return {
      type: 'vect',
      exp: exp,
      width: mods[2],
      x1: mods[3],
      y1: mods[4],
      x2: mods[5],
      y2: mods[6],
      rot: mods[7],
    }
  }

  // center rectangle
  if (code === 21) {
    return {
      type: 'rect',
      exp: exp,
      width: mods[2],
      height: mods[3],
      cx: mods[4],
      cy: mods[5],
      rot: mods[6],
    }
  }

  if (code === 22) {
    parser._warn(
      'macro aperture lower-left rectangle primitives are deprecated'
    )
    return {
      type: 'rectLL',
      exp: exp,
      width: mods[2],
      height: mods[3],
      x: mods[4],
      y: mods[5],
      rot: mods[6],
    }
  }

  if (code === 4) {
    return {
      type: 'outline',
      exp: exp,
      points: mods.slice(3, -1),
      rot: mods[mods.length - 1],
    }
  }

  if (code === 5) {
    return {
      type: 'poly',
      exp: exp,
      vertices: mods[2],
      cx: mods[3],
      cy: mods[4],
      dia: mods[5],
      rot: mods[6],
    }
  }

  if (code === 6) {
    // moire primitive always has exposure on
    return {
      type: 'moire',
      exp: 1,
      cx: mods[1],
      cy: mods[2],
      dia: mods[3],
      ringThx: mods[4],
      ringGap: mods[5],
      maxRings: mods[6],
      crossThx: mods[7],
      crossLen: mods[8],
      rot: mods[9],
    }
  }

  if (code === 7) {
    // thermal primitive always had exposure on
    return {
      type: 'thermal',
      exp: 1,
      cx: mods[1],
      cy: mods[2],
      outerDia: mods[3],
      innerDia: mods[4],
      gap: mods[5],
      rot: mods[6],
    }
  } else {
    parser._warn(code + ' is an unrecognized primitive for a macro aperture')
  }
}

module.exports = parseMacroBlock
