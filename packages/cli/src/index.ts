import yargs from 'yargs'

import {parse} from './parse'
import {plot} from './plot'
import {render} from './render'
import type {ParseOptions} from './parse'
import type {PlotOptions} from './plot'
import type {RenderOptions} from './render'

export interface RunOptions {
  exitProcess?: boolean
}

export async function run(
  processArgv: string[],
  options: RunOptions = {}
): Promise<void> {
  const {exitProcess = false} = options

  await yargs(processArgv)
    .command<RenderOptions>({
      command: ['$0 <files..>', 'render <files..>'],
      describe: 'Render Gerber/drill files into SVGs',
      builder: {
        output: {alias: 'o', type: 'string', describe: 'Output directory'},
        'layers-only': {
          alias: 'l',
          type: 'boolean',
          describe: 'Only output layer renders',
          conflicts: 'board-only',
        },
        'board-only': {
          alias: 'b',
          type: 'boolean',
          describe: 'Only output board renders',
          conflicts: 'layers-only',
        },
        parse: {type: 'boolean', describe: 'Write intermediate parse trees'},
        plot: {type: 'boolean', describe: 'Write intermediate plot trees'},
      },
      handler: render,
    })
    .command<PlotOptions>({
      command: 'plot <files..>',
      describe: 'Plot Gerber/drill files into image tree documents',
      builder: {
        output: {alias: 'o', type: 'string', describe: 'Output directory'},
        parse: {type: 'boolean', describe: 'Write intermediate parse trees'},
      },
      handler: plot,
    })
    .command<ParseOptions>({
      command: 'parse <files..>',
      describe: 'Parse Gerber/drill files into syntax tree documents',
      builder: {
        output: {alias: 'o', type: 'string', describe: 'Output directory'},
      },
      handler: parse,
    })
    .scriptName(__PKG_BIN_NAME__)
    .version(__PKG_VERSION__)
    .help()
    .exitProcess(exitProcess)
    .parseAsync()
}
