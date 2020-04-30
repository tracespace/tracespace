'use strict'

const path = require('path')
const globby = require('globby')
const isGlob = require('is-glob')
const slash = require('slash')
const untildify = require('untildify')
const debug = require('debug')('@tracespace/cli')

function normalize(filename) {
  return path.normalize(untildify(filename))
}

function resolvePatterns(patterns) {
  const normalized = patterns.map(normalize)
  const files = normalized.filter(p => !isGlob(slash(p)))
  const globs = normalized.map(slash).filter(isGlob)

  debug('patterns', patterns, 'mapped to files', files, 'and globs', globs)

  const matchPatterns = globs.length > 0 ? globby(globs) : Promise.resolve([])

  return matchPatterns.then(matches => {
    debug('glob matches', matches)
    return files.concat(matches.filter(m => files.indexOf(m) === -1))
  })
}

module.exports = {normalize, resolvePatterns}
