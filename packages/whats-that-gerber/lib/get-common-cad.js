'use strict'

module.exports = function getCommonCad (matches) {
  var cadCount = matches.reduce(function (counts, match) {
    counts[match.cad] = counts[match.cad] + 1 || 1
    return counts
  }, {})

  return Object.keys(cadCount).reduce(
    function (maxAndName, name) {
      var count = cadCount[name]
      if (count > maxAndName.max) return {max: count, name: name}
      return maxAndName
    },
    {max: 0, name: null}
  ).name
}
