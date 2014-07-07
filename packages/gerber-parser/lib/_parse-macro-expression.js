// parse a macro expression and return a function that takes mods
'use strict'

var partial = require('lodash.partial')

var reOP = /[+\-\/xX()]/
var reNUMBER = /[$\d.]+/
var reTOKEN = new RegExp([reOP.source, reNUMBER.source].join('|'), 'g')

var parseMacroExpression = function(parser, expr) {
  // tokenize the expression
  var tokens = expr.match(reTOKEN)

  // forward declare parse expression
  var parseExpression

  // primary tokens are numbers and parentheses
  var parsePrimary = function() {
    var t = tokens.shift()
    var exp

    if (reNUMBER.test(t)) {
      exp = {type: 'n', val: t}
    }
    else {
      exp = parseExpression()
      tokens.shift()
    }
    return exp
  }

  // parse multiplication and division tokens
  var parseMultiplication = function() {
    var exp = parsePrimary()
    var t = tokens[0]

    if (t === 'X') {
      parser._warn("multiplication in macros should use 'x', not 'X'")
      t = 'x'
    }
    while ((t === 'x') || (t === '/')) {
      tokens.shift()
      var right = parsePrimary()
      exp = {type: t, left: exp, right: right}
      t = tokens[0]
    }
    return exp
  }

  // parse addition and subtraction tokens
  parseExpression = function() {
    var exp = parseMultiplication()
    var t = tokens[0]
    while ((t === '+') || (t === '-')) {
      tokens.shift()
      var right = parseMultiplication()
      exp = {type: t, left: exp, right: right}
      t = tokens[0]
    }
    return exp
  }

  // parse the expression string into a binary tree
  var tree = parseExpression()

  // evalute by recursively traversing the tree
  var evaluate = function(op, mods) {
    var getValue = function(t) {
      if (t[0] === '$') {
        return Number(mods[t])
      }
      return Number(t)
    }

    var type = op.type
    if (type === 'n') {
      return getValue(op.val)
    }
    if (type === '+') {
      return (evaluate(op.left, mods) + evaluate(op.right, mods))
    }
    if (type === '-') {
      return (evaluate(op.left, mods) - evaluate(op.right, mods))
    }
    if (type === 'x') {
      return (evaluate(op.left, mods) * evaluate(op.right, mods))
    }
    // else division
    return (evaluate(op.left, mods) / evaluate(op.right, mods))
  }

  // return the evaluation function bound to the parsed expression tree
  return partial(evaluate, tree)
}

module.exports = parseMacroExpression
