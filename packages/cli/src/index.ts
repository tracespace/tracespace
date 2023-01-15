import {createReadStream} from 'node:fs'
import {writeFile} from 'node:fs/promises'
import path from 'node:path'

import common from 'common-prefix'
import {get} from 'dot-prop'
import glob from 'globby'
import makeDir from 'make-dir'
import createLogger from 'debug'

import type {Options as GerberToSvgOptions} from 'gerber-to-svg'
import gerberToSvg from 'gerber-to-svg'
import type {Stackup, InputLayer} from 'pcb-stackup'
import pcbStackup from 'pcb-stackup'
import * as LayerId from '@tracespace/identify-layers'
import yargs from 'yargs'

import {examples} from './examples'
import {options, STDOUT} from './options'
import {resolve} from './resolve'
import type {Config} from './types'

export {options} from './options'

const debug = createLogger('@tracespace/cli')

export async function cli(
  processArgv: string[],
  config: Partial<Config>
): Promise<unknown> {
  const argv = yargs
    .scriptName('tracespace')
    .usage(
      '$0 [options] <files...>',
      `${__PKG_DESCRIPTION__}\nv${__PKG_VERSION__}`,
      yargs => {
        for (const example of examples) {
          yargs.example(example.cmd, example.desc)
        }

        yargs.epilog(
          `You may also specify options in the current working directory using a config file in (.tracespacerc, .tracespacerc.json, tracespace.config.js, etc.) or a "tracespace" key in package.json`
        )

        return yargs.positional('files', {
          coerce: (files: string[]) => files.map(resolve),
          describe:
            "Filenames, directories, or globs to a PCB's Gerber/drill files",
          type: 'string',
        })
      }
    )
    .options(options)
    .config(config)
    .version(__PKG_VERSION__)
    .help()
    .alias({help: 'h', version: 'v'})
    .fail((error: string) => {
      throw new Error(error)
    })
    .parserConfiguration({'boolean-negation': false})
    .parse(processArgv)

  debug('argv', argv)

  const info = (message: string): void => {
    if (!argv.quiet) console.warn(message)
  }

  if (config._configFile) info(`Config loaded from ${config._configFile}`)

  const files = argv.files as Config['files']
  const out = argv.out as Config['out']
  const boardOptions = (argv.board as Config['board']) ?? {}
  const gerberOptions = (argv.gerber as Config['gerber']) ?? {}
  const drillOptions = (argv.drill as Config['drill']) ?? {}
  const layerOptions = (argv.layer as Config['layer']) ?? {}

  return glob(files).then(renderFiles).then(writeRenders)

  async function renderFiles(filenames: string[]): Promise<Stackup> {
    const typesByName = LayerId.identifyLayers(filenames)
    const layers = filenames
      .map(filename => makeLayerFromFilename(filename, typesByName))
      .filter((ly): ly is InputLayer => ly !== null)

    if (layers.length === 0) {
      throw new Error('No valid Gerber or drill files found')
    }

    return pcbStackup(layers, boardOptions)
  }

  function makeLayerFromFilename(
    filename: string,
    typesByName: LayerId.LayerIdentityMap
  ): InputLayer | null {
    const basename = path.basename(filename)
    const {type, side} = getType(basename, typesByName[filename])

    if (type === null && !argv.force) {
      info(`Skipping ${basename} (unable to identify type)`)
      return null
    }

    info(`Rendering ${basename} as ${type!} (${side!})`)

    const gerber = createReadStream(filename)
    const options = getOptions(basename, type)

    debug(filename, type, side, options)

    return {type, side, gerber, options, filename: basename}
  }

  function getType(
    basename: string,
    defaults: LayerId.LayerIdentity
  ): LayerId.LayerIdentity {
    return {
      side: get(layerOptions, `${basename}.side`, defaults.side),
      type: get(layerOptions, `${basename}.type`, defaults.type),
    }
  }

  function getOptions(
    basename: string,
    type: LayerId.GerberType
  ): GerberToSvgOptions {
    const defaultOptions = type === 'drill' ? drillOptions : gerberOptions

    return get(layerOptions, `${basename}.options`, defaultOptions)
  }

  async function writeRenders(stackup: Stackup): Promise<unknown> {
    const name = inferBoardName(stackup)
    const ensureDir: Promise<unknown> =
      out === STDOUT ? Promise.resolve() : makeDir(out)

    return ensureDir.then(async () =>
      Promise.all([
        !argv.noBoard && writeOutput(`${name}.top.svg`, stackup.top.svg),
        !argv.noBoard && writeOutput(`${name}.bottom.svg`, stackup.bottom.svg),
        ...stackup.layers
          .filter(_ => !argv.noLayer)
          .map(async layer => {
            let filename = layer.filename ?? ''
            if (layer.side) filename += `.${layer.side}`
            if (layer.type) filename += `.${layer.type}`

            return writeOutput(
              `${filename}.svg`,
              gerberToSvg.render(
                layer.converter,
                (layer.options as GerberToSvgOptions).attributes ?? {}
              )
            )
          }),
      ])
    )
  }

  async function writeOutput(name: string, contents: string): Promise<unknown> {
    if (argv.out === STDOUT) {
      console.log(contents)
      return
    }

    const filename = path.join(out, name)
    info(`Writing ${filename}`)
    return writeFile(filename, contents)
  }
}

function inferBoardName(stackup: Stackup): string {
  const names = stackup.layers
    .map(ly => ly.filename ?? '')
    .map(name => path.basename(name, path.extname(name)))

  return common(names) ?? 'board'
}
