#!/usr/bin/env node
'use strict'

var fs = require('fs')
var path = require('path')
var chalk = require('chalk')
var parseArgs = require('yargs-parser')
var mkdir = require('mkdirp')
var padEnd = require('lodash.padend')
var padStart = require('lodash.padstart')
var xmlovely = require('xmlovely')

var gerberToSvg = require('../lib/gerber-to-svg')

// version number
var VERSION = require('../package.json').version

// TAKE A LOOK AT BANNER MICHAEL
var BANNER = [
  'converts printed circuit board Gerber and drill files to SVG',
  '',
  'usage:',
  '  gerber-to-svg [options] -- gerber_files',
  '',
  'examples:',
  '  convert gerber.gbr and output to stdout',
  '    $ gerber-to-svg gerber.gbr',
  '  convert and output to out/gerber.svg',
  '    $ gerber-to-svg --out=out -- gerber.gb',
  '  output to out/gerber.gbr.svg',
  '    $ gerber-to-svg --out=out --append-ext --  gerber.gbr',
  '  plot edge-cuts.gbr as an outline',
  '    $ gerber-to-svg --plot-as-outline -- edge-cuts.gbr',
  '  plot edge-cuts-with-big-gaps.gbr and fill gaps smaller than 0.011',
  '    $ gerber-to-svg --plot-as-outline=0.011 -- edge-cuts-with-big-gaps.gbr',
  '  specify attributes like color, height, and width',
  '    $ gerber-to-svg --attr.color=blue --attr.width="100%" --attr.height="100%"',
  ''
].join('\n')

var OPTIONS = [
  ['o', 'out', 'specify an output directory'],
  ['q', 'quiet', 'do not print warnings and messages'],
  ['p', 'pretty', 'indent output with this length tabs (2 if unspecified)'],
  ['a', 'attr', 'SVG attributes to add or change (e.g. --attr.color=blue)'],
  [
    'e',
    'append-ext',
    'append .svg rather than replacing the existing extension'
  ],
  ['f', 'format', "override coordinate decimal places format with '[INT,DEC]'"],
  ['z', 'zero', "override zero suppression with 'L' or 'T'"],
  ['u', 'units', "set backup units to 'mm' or 'in'"],
  ['n', 'notation', "set backup absolute/incremental notation with 'A' or 'I'"],
  [
    't',
    'optimize-paths',
    'rearrange trace paths by to occur in physical order'
  ],
  [
    'b',
    'plot-as-outline',
    'fill gaps smaller than 0.00011 (or specified number) in layer units'
  ],
  ['v', 'version', 'display version information'],
  ['h', 'help', 'display this help text']
]

var STRING_OPTS = ['out', 'format', 'zero', 'units', 'notation']
var BOOLEAN_OPTS = ['quiet', 'append-ext', 'optimize-paths', 'version', 'help']
var ALIAS_OPTS = OPTIONS.reduce(function (alias, opt) {
  alias[opt[0]] = opt[1]

  return alias
}, {})

var printVersion = function () {
  console.log('gerber2svg version', VERSION)
}

var printBanner = function () {
  console.log(BANNER)
}

var printOptions = function () {
  var maxLength = OPTIONS.reduce(
    function (result, opt) {
      return {
        longOpt: Math.max(result.longOpt, opt[1].length),
        desc: Math.max(result.description, opt[2].length)
      }
    },
    {longOpt: 0, desc: 0}
  )

  OPTIONS.forEach(function (opt) {
    var longOpt = padEnd(opt[1], maxLength.longOpt)
    var desc = padStart(opt[2], maxLength.desc)
    console.log('-' + opt[0] + ', --' + longOpt + '  ' + desc)
  })
}

var printHelp = function () {
  printVersion()
  printBanner()
  printOptions()
}

var argv = parseArgs(process.argv.slice(2), {
  alias: ALIAS_OPTS,
  string: STRING_OPTS,
  boolean: BOOLEAN_OPTS,
  stopEarly: true
})

if (argv.version) {
  printVersion()
  process.exit()
}

if (argv.help || argv._.length === 0) {
  printHelp()
  process.exit()
}

var error = function (string) {
  console.error(chalk.bold.red(string))
}

var warn = function (string) {
  if (!argv.quiet) {
    console.warn(chalk.bold.yellow(string))
  }
}

var info = function (string) {
  if (!argv.quiet) {
    console.info(chalk.bold.white(string))
  }
}

var getOpts = function (id) {
  var opts = {
    id: id,
    optimizePaths: argv['optimize-paths']
  }

  if (argv.attr) {
    opts.attributes = argv.attr
  }

  if (argv.format) {
    opts.places = JSON.parse(argv.format)
  }

  if (argv.zero) {
    opts.zero = argv.zero
  }

  if (argv.units) {
    opts.backupUnits = argv.units
  }

  if (argv.notation) {
    opts.backupNota = argv.notation
  }

  switch (argv['plot-as-outline']) {
    case true:
    case 'true':
      opts.plotAsOutline = true
      break

    default:
      opts.plotAsOutline = Number(argv['plot-as-outline']) || false
  }

  return opts
}

var convert = function (err) {
  if (err) {
    return error(err.message)
  }

  argv._.forEach(function processGerber (gerberFile) {
    var out = process.stdout
    var ext = !argv.a ? path.extname(gerberFile) : ''
    var base = path.basename(gerberFile, ext)

    if (argv.out) {
      var outFile = path.join(path.join(argv.out, base + '.svg'))

      out = fs.createWriteStream(outFile)
      out.on('finish', function () {
        info(gerberFile + ' converterted to ' + outFile)
      })
    }

    if (argv.pretty) {
      var indent = argv.pretty === true ? 2 : argv.pretty
      var originalOut = out

      out = xmlovely(indent)
      out.pipe(originalOut)
    }

    var gerberStream = fs.createReadStream(gerberFile)
    var converter = gerberToSvg(gerberStream, getOpts(base))

    converter.on('warning', function (w) {
      warn('warning at line ' + w.line + ' - ' + w.message)
    })

    converter.pipe(out)
  })
}

// create the outdir if necesary
// convert the files either way
if (argv.out) {
  mkdir(argv.out, convert)
} else {
  convert()
}
