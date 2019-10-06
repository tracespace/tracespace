import fs from 'fs'
import path from 'path'
import util from 'util'
import common from 'common-prefix'
import {get} from 'dot-prop'
import glob from 'globby'
import makeDir from 'make-dir'
import createLogger from 'debug'

import gerberToSvg, {Options as GerberToSvgOptions} from 'gerber-to-svg'
import pcbStackup, {Stackup, InputLayer} from 'pcb-stackup'
import * as Wtg from 'whats-that-gerber'
import yargs from 'yargs'

import {examples} from './examples'
import {options, STDOUT} from './options'
import {resolve} from './resolve'
import {Config} from './types'

const debug = createLogger('@tracespace/cli')
const writeFile = util.promisify(fs.writeFile)

export {options}

export function cli(
  processArgv: string[],
  config: Partial<Config>
): Promise<unknown> {
  const argv = yargs
    .usage(
      '$0 [options] <files...>',
      `${__PKG_DESCRIPTION__}\nv${__PKG_VERSION__}`,
      yargs => {
        examples.forEach(e => yargs.example(e.cmd, e.desc))

        yargs.epilog(
          `You may also specify options in the current working directory using a config file in (.tracespacerc, .tracespacerc.json, tracespace.config.js, etc.) or a "tracespace" key in package.json`
        )

        return yargs.positional('files', {
          coerce: files => files.map(resolve),
          describe:
            "Filenames, directories, or globs to a PCB's Gerber/drill files",
          type: 'string',
        })
      }
    )
    .options(options)
    .config(config)
    .version()
    .help()
    .alias({help: 'h', version: 'v'})
    .fail((error: string) => {
      throw new Error(error)
    })
    .parserConfiguration({'boolean-negation': false})
    .parse(processArgv)

  debug('argv', argv)

  const info = (msg: string): unknown => !argv.quiet && console.warn(msg)

  if (config._configFile) info(`Config loaded from ${config._configFile}`)

  const files = argv.files as Config['files']
  const out = argv.out as Config['out']
  const boardOpts = (argv.board as Config['board']) || {}
  const gerberOpts = (argv.gerber as Config['gerber']) || {}
  const drillOpts = (argv.drill as Config['drill']) || {}
  const layerOpts = (argv.layer as Config['layer']) || {}

  return glob(files)
    .then(renderFiles)
    .then(writeRenders)

  function renderFiles(filenames: string[]): Promise<Stackup> {
    const typesByName = Wtg.identifyLayers(filenames)
    const layers = filenames
      .map(filename => makeLayerFromFilename(filename, typesByName))
      .filter((ly): ly is InputLayer => Boolean(ly))

    if (!layers.length) throw new Error(`No valid Gerber or drill files found`)

    return pcbStackup(layers, boardOpts)
  }

  function makeLayerFromFilename(
    filename: string,
    typesByName: Wtg.LayerIdentityMap
  ): InputLayer | null {
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

  function getType(
    basename: string,
    defaults: Wtg.LayerIdentity
  ): Wtg.LayerIdentity {
    return {
      side: get(layerOpts, `${basename}.side`, defaults.side),
      type: get(layerOpts, `${basename}.type`, defaults.type),
    }
  }

  function getOptions(
    basename: string,
    type: Wtg.GerberType
  ): GerberToSvgOptions {
    const defaultOptions = type === 'drill' ? drillOpts : gerberOpts

    return get(layerOpts, `${basename}.options`, defaultOptions)
  }

  function writeRenders(stackup: Stackup): Promise<unknown> {
    const name = inferBoardName(stackup)
    const ensureDir: Promise<unknown> =
      out !== STDOUT ? makeDir(out) : Promise.resolve()

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
              gerberToSvg.render(
                layer.converter,
                layer.options.attributes || {}
              )
            )
          }),
      ])
    )
  }

  function writeOutput(name: string, contents: string): Promise<unknown> {
    if (argv.out === STDOUT) return Promise.resolve(console.log(contents))

    const filename = path.join(out, name)
    info(`Writing ${filename}`)
    return writeFile(filename, contents)
  }
}

function inferBoardName(stackup: Stackup): string {
  const names = stackup.layers
    .map(ly => ly.filename || '')
    .map(name => path.basename(name, path.extname(name)))

  return common(names) || 'board'
}
