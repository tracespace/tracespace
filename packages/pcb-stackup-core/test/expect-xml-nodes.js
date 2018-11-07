// helper to expect an chain of element calls
// TODO(mc, 2018-01-16): refactor with testdouble and assert
'use strict'

var chai = require('chai')
var sinonChai = require('sinon-chai')
var expect = chai.expect

chai.use(sinonChai)

// element is a sinon spy, expectations is an array of expectations of {tag, attr, children}
// children is an array of indices of return values from expectations
module.exports = function expectXmlNodes(element, expectations) {
  var returnValues = []

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

    var spy

    if (!children) {
      spy = element.withArgs(tag, attr)
      expect(element).to.be.calledWith(tag, attr)
    } else {
      spy = element.withArgs(tag, attr, children)
      expect(element).to.be.calledWith(tag, attr, children)
    }

    returnValues.push(spy.returnValues[0])
  })

  return returnValues
}
