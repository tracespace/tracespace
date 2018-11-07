'use strict'

const fs = require('fs')
const path = require('path')
const glob = require('glob')
const runParallel = require('run-parallel')
const runWaterfall = require('run-waterfall')

const server = require('./server')
const gerberFilenames = require('./gerber-filenames.json')

const GLOB_BOARD_MANIFEST = path.join(__dirname, 'boards/**/manifest.json')
const GLOB_SPEC_GERBER = path.join(__dirname, 'gerbers/**/*.@(gbr|drl|svg)')

module.exports = {
  gerberFilenames,
  getBoards,
  getGerberSpecs,
  server,
}

function getBoards(done) {
  runWaterfall(
    [
      next => glob(GLOB_BOARD_MANIFEST, next),
      (manifestPaths, next) =>
        runParallel(
          manifestPaths.map(manifest => next => readManifest(manifest, next)),
          next
        ),
    ],
    done
  )
}

getBoards.sync = function getBoardsSync() {
  const manifests = glob.sync(GLOB_BOARD_MANIFEST)

  return manifests.map(manifest => readManifest.sync(manifest))
}

function getGerberSpecs(done) {
  runWaterfall(
    [
      next => glob(GLOB_SPEC_GERBER, next),
      (gerberPaths, next) =>
        runParallel(
          gerberPaths.map(gerber => next => readFile(gerber, {}, next)),
          next
        ),
      (gerberSpecs, next) => next(null, collectSpecs(gerberSpecs)),
    ],
    done
  )
}

getGerberSpecs.sync = function() {
  const paths = glob.sync(GLOB_SPEC_GERBER)
  const specs = paths.map(filepath => readFile.sync(filepath, {}))

  return collectSpecs(specs)
}

function readManifest(manifestPath, done) {
  const name = path.basename(path.dirname(manifestPath))

  runWaterfall(
    [next => readFile(manifestPath, {name}, next), addLayersToManifest],
    done
  )
}

readManifest.sync = function readManifestSync(manifestPath) {
  const name = path.basename(path.dirname(manifestPath))
  const manifest = readFile.sync(manifestPath, {name})

  return addLayersToManifest.sync(manifest)
}

function getLayerFilepath(manifest, layer) {
  return path.join(path.dirname(manifest.filepath), layer.name)
}

function addLayersToManifest(manifest, done) {
  runWaterfall(
    [
      next =>
        runParallel(
          manifest.layers.map(layer => next =>
            readFile(getLayerFilepath(manifest, layer), layer, next)
          ),
          next
        ),
      (layers, next) => next(null, Object.assign(manifest, {layers})),
    ],
    done
  )
}

addLayersToManifest.sync = function addLayersToManifestSync(manifest) {
  const layers = manifest.layers.map(layer =>
    readFile.sync(getLayerFilepath(manifest, layer), layer)
  )

  return Object.assign(manifest, {layers})
}

function readFile(filepath, props, done) {
  runWaterfall(
    [
      next => fs.readFile(filepath, 'utf8', next),
      (source, next) => next(null, makeFileResult(filepath, props, source)),
    ],
    done
  )
}

readFile.sync = function readFileSync(filepath, props) {
  const source = fs.readFileSync(filepath, 'utf8')

  return makeFileResult(filepath, props, source)
}

function makeFileResult(filepath, props, source) {
  const dirname = path.dirname(filepath)
  const category = path.basename(dirname)
  const extname = path.extname(filepath)
  const filename = path.basename(filepath)
  const name = path.basename(filepath, extname)
  const file = {category, filepath, filename, name}
  const result =
    extname.toLowerCase() === '.json' ? JSON.parse(source) : {source}

  return Object.assign(file, result, props)
}

function collectSpecs(gerberSpecs) {
  const {suites, suitesByName} = gerberSpecs.reduce(
    (result, spec) => {
      const {category, name} = spec

      if (path.extname(spec.filepath).toLowerCase() === '.svg') {
        spec = {expected: spec.source}
      }

      if (!result.suitesByName[category]) {
        result.suites.push(category)
        result.suitesByName[category] = {
          name: category,
          specs: [name],
          specsByName: {[name]: spec},
        }
      } else if (result.suitesByName[category].specs.indexOf(name) < 0) {
        result.suitesByName[category].specs.push(name)
        result.suitesByName[category].specsByName[name] = spec
      } else {
        result.specsByName = Object.assign(
          result.suitesByName[category].specsByName[name],
          spec
        )
      }

      return result
    },
    {suites: [], suitesByName: {}}
  )

  return suites.map(name => ({
    name,
    specs: suitesByName[name].specs.map(
      specName => suitesByName[name].specsByName[specName]
    ),
  }))
}
