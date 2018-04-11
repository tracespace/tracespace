// checks if package version in cwd is new and publishes if it is
// npm view ${packageName} --json
// npm publish --tag ${tag}
'use strict'

const assert = require('assert')
const execa = require('execa')
const readPkg = require('read-pkg')
const debug = require('debug')('tracespace/scripts/publish')

const NPM = 'npm'
const PACKAGE_NAME = process.env.LERNA_PACKAGE_NAME

assert(PACKAGE_NAME, 'expected $LERNA_PACKAGE_NAME to be defined')

// semver matcher with optional capture group on preid
const RE_SEMVER = /^\d\.\d\.\d(?:-(.+?)(?:\.\d+)?)?$/
const DEFAULT_TAG = 'latest'

log(`running from ${process.cwd()}`)

getVersionInfo()
  .then(getPublishInfo)
  .then(logPublishInfo)
  .then(publish)
  .catch(error => {
    // treat already published as success
    if (error.name === 'AlreadyPublishedError') return error.message

    log(error, 'error')
    process.exit(1)
  })
  .then(log)

function getVersionInfo () {
  return Promise.all([getVersion(), getPublishedVersions()]).then(results => {
    const [version, published] = results

    assert(version, 'Expected version to be a non-empty string')
    assert(Array.isArray(published), 'Expected published to be an array')

    return {version, published}
  })
}

function getPublishInfo (versionInfo) {
  return Promise.all([
    getVersionToPublish(versionInfo),
    getTagToPublish(versionInfo)
  ]).then(results => ({version: results[0], tag: results[1]}))
}

function logPublishInfo (publishInfo) {
  const {version, tag} = publishInfo

  log(`publishing v${version} to tag ${tag}`)

  return publishInfo
}

function publish (publishInfo) {
  const {tag} = publishInfo

  return npm('publish', '--tag', tag).then(result => result.stdout)
}

function getVersion () {
  return readPkg({normalize: false}).then(pkg => {
    assert(pkg.name === PACKAGE_NAME, 'package.json name was incorrect')

    return pkg.version
  })
}

function getPublishedVersions () {
  const parseStdout = result => result.stdout && JSON.parse(result.stdout)

  return npm('view', PACKAGE_NAME, 'versions', '--json')
    .then(parseStdout)
    .catch(error => {
      // allow 404, because if it's not there then publish is possible
      if (error.stdout && parseStdout(error).error.code === 'E404') {
        return []
      }

      return Promise.reject(error)
    })
}

function getVersionToPublish (versionInfo) {
  const {version, published} = versionInfo

  if (published.indexOf(version) > -1) {
    return Promise.reject(AlreadyPublishedError(version))
  }

  return version
}

function getTagToPublish (versionInfo) {
  const {version} = versionInfo
  const tagMatch = version.match(RE_SEMVER)

  assert(tagMatch, 'Expected version to match RE_SEMVER')

  return tagMatch[1] || DEFAULT_TAG
}

function npm (...args) {
  return execa(NPM, args)
    .then(result => {
      debug(result.cmd, 'stdout>', result.stdout)
      return result
    })
    .catch(error => {
      debug(error.cmd, 'stdout>', error.stdout, 'stderr>', error.stderr)
      return Promise.reject(error)
    })
}

function log (message, level) {
  level = level || 'log'
  console[level](`scripts/publish.js > ${PACKAGE_NAME} >`, message)
}

function AlreadyPublishedError (version) {
  return Object.assign(
    new Error(`${PACKAGE_NAME} v${version} is already published`),
    {name: 'AlreadyPublishedError'}
  )
}
