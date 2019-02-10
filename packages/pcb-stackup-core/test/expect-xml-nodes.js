// helper to expect an chain of element calls
// TODO(mc, 2019-01-24): this is fundamentally broken / a bad idea
'use strict'

var util = require('util')
var expect = require('chai').expect
var isEqual = require('lodash/isEqual')
var pull = require('lodash/pull')

// element is a sinon spy, expectations is an array of expectations of {tag, attr, children}
// children is an array of indices of return values from expectations
module.exports = function expectXmlNodes(element, expectations) {
  var returnValues = []
  var calls = element.getCalls()

  expectations.forEach(function(expectation) {
    var tag = expectation.tag
    var attr = expectation.attr
    var children = expectation.children

    if (children) {
      children = children.map(function(index) {
        if (typeof index === 'number') {
          return returnValues[index]
        }

        return index
      })
    }

    var spyCall = popCallByArgs(calls, tag, attr, children)

    expect(
      spyCall != null,
      'element(' +
        tag +
        ', ' +
        util.format(attr) +
        ', ' +
        util.format(children) +
        ') not called'
    ).to.equal(true)

    returnValues.push(spyCall.returnValue)
  })

  return returnValues
}

// modifies calls argument
function popCallByArgs(calls, tag, attr, children) {
  var matchingCall = calls.find(function(call) {
    return (
      isEqualOrMatches(call.args[0], tag) &&
      isEqualOrMatches(call.args[1], attr) &&
      isEqualOrMatches(call.args[2], children)
    )
  })

  if (!matchingCall) return null

  pull(calls, [matchingCall])
  return matchingCall
}

function isEqualOrMatches(value, matcher) {
  return matcher && typeof matcher.test === 'function'
    ? matcher.test(value)
    : isEqual(value, matcher)
}
