'use strict'

const assert = require('assert')
const semver = require('semver')

const argv = process.argv.slice(2)
const version = argv[0]

assert(version, 'Expected first argument to be the version')
assert(semver.valid(version), `Expected ${version} to be semver valid`)

const prerelease = semver.prerelease(version)

if (prerelease) {
  console.log(prerelease[0])
} else {
  console.log('latest')
}

process.exit(0)
