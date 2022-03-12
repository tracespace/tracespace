'use strict'

const assert = require('assert')
const semver = require('semver')

const VERSION_REF_RE = /^refs\/tags\/(.+)$/

const argv = process.argv.slice(2)
const ref = argv[0]
const version = typeof ref === 'string' ? ref.match(VERSION_REF_RE) : null

assert(version, `Expected to be called with git tag ref, but got ${ref}`)
assert(semver.valid(version[1]), `Expected semver, but got ${version[1]}`)

const prerelease = semver.prerelease(version[1])

if (prerelease) {
  console.log(prerelease[0])
} else {
  console.log('latest')
}

process.exitCode = 0
