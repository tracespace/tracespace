import {resolve} from './resolve'
import {ArgOptions} from './types'

export const STDOUT = '-'

const STRING = 'string'
const BOOLEAN = 'boolean'

const out: ArgOptions = {
  alias: 'o',
  coerce: (path: string): string => (path === STDOUT ? path : resolve(path)),
  default: '.',
  describe: `Output directory (or \`${STDOUT}\` for stdout)`,
  type: STRING,
  example: {
    cmd: '$0 --out=renders',
    desc: 'Write SVGs into directory `./renders`',
  },
}

const noBoard: ArgOptions = {
  alias: 'B',
  describe: 'Skip rendering PCB top and bottom',
  type: BOOLEAN,
  example: {
    cmd: '$0 -B',
    desc: 'Output only the individual layer renders',
  },
}

const noLayer: ArgOptions = {
  alias: 'L',
  describe: 'Skip rendering individual Gerber and drill layers',
  type: BOOLEAN,
  example: {
    cmd: '$0 -L',
    desc: 'Output only the top and bottom PCB renders',
  },
}

const force: ArgOptions = {
  alias: 'f',
  describe: "Attempt to render files even if they're unrecognized",
  type: BOOLEAN,
  example: {
    cmd: '$0 -B --force some-file.xyz',
    desc: 'Attempt render even if whats-that-gerber cannot identify',
  },
}

const quiet: ArgOptions = {
  alias: 'q',
  describe: 'Suppress informational output (info logs to stderr)',
  type: BOOLEAN,
  example: {
    cmd: '$0 --quiet',
    desc: 'Do not print info to stderr',
  },
}

const gerber: ArgOptions = {
  alias: 'g',
  describe: 'Options for all gerber files (passed to gerber-to-svg)',
  example: {
    cmd: '$0 -B -g.attributes.color=blue',
    desc: 'Set the color attribute of all Gerber SVGs',
  },
}

const drill: ArgOptions = {
  alias: 'd',
  describe: 'Options for all drill files (passed to gerber-to-svg)',
  example: {
    cmd: '$0 -B -d.attributes.color=red',
    desc: 'Set the color attribute of all drill SVGs',
  },
}

const board: ArgOptions = {
  alias: 'b',
  describe: 'Options for PCB renders (passed to pcb-stackup)',
  example: {
    cmd: '$0 -b.color.sm="rgba(128,00,00,0.75)"',
    desc: 'Set the soldermask color of the board renders',
  },
}

const layer: ArgOptions = {
  alias: 'l',
  describe: 'Override the layers options of a given file',
  example: {
    cmd:
      '$0 -l.arduino-uno.drd.type=drill -l.arduino-uno.drd.options.filetype=drill',
    desc:
      'Set layer type of `arduino-uno.drd` to `drill` and parse as a drill file',
    aside:
      "If you're using this option a lot, you may want to consider using a config file",
  },
}

export const options = {
  out,
  noBoard,
  noLayer,
  force,
  quiet,
  gerber,
  drill,
  board,
  layer,
}
