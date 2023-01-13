import yargs from 'yargs'

import {parse} from './parse'
import {plot} from './plot'
import {render} from './render'
import type {ParseArgs} from './parse'
import type {PlotArgs} from './plot'
import type {RenderArgs} from './render'

export async function run(processArgv: string[]): Promise<void> {
  await yargs(processArgv)
    .command<RenderArgs>({
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
    .command<PlotArgs>({
      command: 'plot <files..>',
      describe: 'Plot Gerber/drill files into image tree documents',
      builder: {
        output: {alias: 'o', type: 'string', describe: 'Output directory'},
        parse: {type: 'boolean', describe: 'Write intermediate parse trees'},
      },
      handler: plot,
    })
    .command<ParseArgs>({
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
    .parseAsync()
}
