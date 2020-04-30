'use strict'

const fs = require('fs')
const path = require('path')
const util = require('util')
const common = require('common-prefix')
const {get} = require('dot-prop')
const makeDir = require('make-dir')
const debug = require('debug')('@tracespace/cli')

const gerberToSvg = require('gerber-to-svg')
const pcbStackup = require('pcb-stackup')
const whatsThatGerber = require('whats-that-gerber')
const yargs = require('yargs')

const {description, version} = require('../package.json')
const examples = require('./examples')
const options = require('./options')
const {resolvePatterns} = require('./resolve')

const writeFile = util.promisify(fs.writeFile)
const stackup = util.promisify(pcbStackup)

module.exports = function cli(processArgv, config) {
  const argv = yargs
    .usage('$0 [options] <files...>', `${description}\nv${version}`, yargs => {
      yargs.positional('files', {
        describe:
          "Filenames, directories, or globs to a PCB's Gerber/drill files",
        type: 'string',
      })

      examples.forEach(e => yargs.example(e.cmd, e.desc))

      yargs.epilog(
        `You may also specify options in the current working directory using a config file in (.tracespacerc, .tracespacerc.json, tracespace.config.js, etc.) or a "tracespace" key in package.json`
      )
    })
    .config(config)
    .options(options)
    .version()
    .help()
    .alias({help: 'h', version: 'v'})
    .fail((error, message, yargs) => {
      throw new Error(error)
    })
    .parserConfiguration({'boolean-negation': false})
    .parse(processArgv)

  debug('argv', argv)

  const info = message => !argv.quiet && console.warn(message)

  if (config._configFile) info(`Config loaded from ${config._configFile}`)

  return resolvePatterns(argv.files)
    .then(renderFiles)
    .then(writeRenders)

  function renderFiles(filenames) {
    const typesByName = whatsThatGerber(filenames)
    const layers = filenames
      .map(filename => makeLayerFromFilename(filename, typesByName))
      .filter(_ => _)

    if (!layers.length) throw new Error(`No valid Gerber or drill files found`)

    return stackup(layers, argv.board)
  }

  function makeLayerFromFilename(filename, typesByName) {
    const basename = path.basename(filename)
    const {type, side} = getType(basename, typesByName[filename])

    if (type == null && !argv.force) {
      info(`Skipping ${basename} (unable to identify type)`)
      return null
    }

    info(`Rendering ${basename} as ${type} (${side})`)

    const gerber = fs.createReadStream(filename)
    const options = getOptions(basename, type)

    debug(filename, type, side, options)

    return {type, side, gerber, options, filename: basename}
  }

  function getType(basename, defaults) {
    return {
      side: get(argv.layer, `${basename}.side`, defaults.side),
      type: get(argv.layer, `${basename}.type`, defaults.type),
    }
  }

  function getOptions(basename, type) {
    const defaultOptions = type === 'drill' ? argv.drill : argv.gerber

    return get(argv.layer, `${basename}.options`, defaultOptions)
  }

  function writeRenders(stackup) {
    const name = inferBoardName(stackup)
    const ensureDir =
      argv.out !== options.out.STDOUT ? makeDir(argv.out) : Promise.resolve()

    return ensureDir.then(() =>
      Promise.all([
        !argv.noBoard && writeOutput(`${name}.top.svg`, stackup.top.svg),
        !argv.noBoard && writeOutput(`${name}.bottom.svg`, stackup.bottom.svg),
        ...stackup.layers
          .filter(_ => !argv.noLayer)
          .map(layer => {
            let filename = layer.filename
            if (layer.side) filename += `.${layer.side}`
            if (layer.type) filename += `.${layer.type}`

            return writeOutput(
              `${filename}.svg`,
              gerberToSvg.render(layer.converter, layer.options.attributes)
            )
          }),
      ])
    )
  }

  function writeOutput(name, contents) {
    if (argv.out === options.out.STDOUT) return console.log(contents)

    const filename = path.join(argv.out, name)
    info(`Writing ${filename}`)
    return writeFile(filename, contents)
  }
}

function inferBoardName(stackup) {
  const names = stackup.layers.map(ly =>
    path.basename(ly.filename, path.extname(ly.filename))
  )
  return common(names) || 'board'
}
