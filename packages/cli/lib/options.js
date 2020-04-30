'use strict'

const {normalize} = require('./resolve')

const STDOUT = '-'

module.exports = {
  out: {
    STDOUT,
    alias: 'o',
    coerce: path => (path === STDOUT ? path : normalize(path)),
    default: '.',
    describe: `Output directory (or \`${STDOUT}\` for stdout)`,
    type: 'string',
    example: {
      cmd: '$0 --out=renders',
      desc: 'Write SVGs into directory `./renders`',
    },
  },
  noBoard: {
    alias: 'B',
    describe: 'Skip rendering PCB top and bottom',
    type: 'boolean',
    example: {
      cmd: '$0 -B',
      desc: 'Output only the individual layer renders',
    },
  },
  noLayer: {
    alias: 'L',
    describe: 'Skip rendering individual Gerber and drill layers',
    type: 'boolean',
    example: {
      cmd: '$0 -L',
      desc: 'Output only the top and bottom PCB renders',
    },
  },
  force: {
    alias: 'f',
    describe: "Attempt to render files even if they're unrecognized",
    type: 'boolean',
    example: {
      cmd: '$0 -B --force some-file.xyz',
      desc: 'Attempt render even if whats-that-gerber cannot identify',
    },
  },
  gerber: {
    alias: 'g',
    describe: 'Options for all gerber files (passed to gerber-to-svg)',
    type: 'object',
    example: {
      cmd: '$0 -B -g.attributes.color=blue',
      desc: 'Set the color attribute of all Gerber SVGs',
    },
  },
  drill: {
    alias: 'd',
    describe: 'Options for all drill files (passed to gerber-to-svg)',
    type: 'object',
    example: {
      cmd: '$0 -B -d.attributes.color=red',
      desc: 'Set the color attribute of all drill SVGs',
    },
  },
  board: {
    alias: 'b',
    describe: 'Options for PCB renders (passed to pcb-stackup)',
    type: 'object',
    example: {
      cmd: '$0 -b.color.sm="rgba(128,00,00,0.75)"',
      desc: 'Set the soldermask color of the board renders',
    },
  },
  layer: {
    alias: 'l',
    describe: 'Override the layers options of a given file',
    type: 'object',
    example: {
      cmd:
        '$0 -l.arduino-uno.drd.type=drill -l.arduino-uno.drd.options.filetype=drill',
      desc:
        'Set layer type of `arduino-uno.drd` to `drill` and parse as a drill file',
      aside:
        "If you're using this option a lot, you may want to consider using a config file",
    },
  },
  quiet: {
    alias: 'q',
    describe: 'Suppress informational output (info logs to stderr)',
    type: 'boolean',
    example: {
      cmd: '$0 --quiet',
      desc: 'Do not print info to stderr',
    },
  },
}
