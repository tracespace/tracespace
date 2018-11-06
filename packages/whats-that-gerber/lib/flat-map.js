'use strict'

module.exports = function flatMap (collection, iterator) {
  return collection.reduce(function iterate (result, element) {
    return result.concat(iterator(element))
  }, [])
}
