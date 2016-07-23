#!/usr/bin/env node
'use strict'

var fs = require('fs')
var path = require('path')
var mkdir = require('mkdirp')
var parseArgs = require('minimist')
var chalk = require('chalk')
var xmlovely = require('xmlovely')

var gerberToSvg = require('../lib/gerber-to-svg')

// version number
var VERSION = require('../package.json').version

// TAKE A LOOK AT BANNER MICHAEL
var BANNER = [
  'converts printed circuit board Gerber and drill files to SVG',
  '',
  'usage:',
  '  gerber2svg [options] -- gerber_files',
  '',
  'examples:',
  '  convert gerber.gbr and output to stdout',
  '    $ gerber2svg gerber.gbr',
  '  convert and output to out/gerber.svg',
  '    $ gerber2svg --out out -- gerber.gb',
  '  output to out/gerber.gbr.svg',
  '    $ gerber2svg --out out --append-ext --  gerber.gbr',
  '  plot edge-cuts.gbr as an outline',
  '    $ gerber2svg --plot-as-outline -- edge-cuts.gbr',
  '  plot edge-cuts-with-big-gaps.gbr and fill gaps smaller than 0.011',
  '    $ gerber2svg --plot-as-outline 0.011 -- edge-cuts-with-big-gaps.gbr',
  ''
].join('\n')

var OPTIONS = [
  ['o', 'out', '             specify an output directory'],
  ['q', 'quiet', '           do not print warnings and messages'],
  ['p', 'pretty', '          indent output with this length tabs (2 if unspecified)'],
  ['c', 'color', '           give the layer this color (defaults to "currentColor")'],
  ['a', 'append-ext', '      append .svg rather than replacing the existing extension'],
  ['f', 'format', "          override coordinate decimal places format with '[INT,DEC]'"],
  ['z', 'zero', "            override zero suppression with 'L' or 'T'"],
  ['u', 'units', "           set backup units to 'mm' or 'in'"],
  ['n', 'notation', "        set backup absolute/incremental notation with 'A' or 'I'"],
  ['z', 'optimize-paths', '  rearrange trace paths by to occur in physical order'],
  ['b', 'plot-as-outline', ' optimize paths and fill gaps smaller than 0.00011 (or specified number) in layer units'],
  ['v', 'version', '         display version information'],
  ['h', 'help', '            display this help text']
]

var STRING_OPTS  = ['out', 'color', 'format', 'zero', 'units', 'notation']
var BOOLEAN_OPTS = ['quiet', 'append-ext', 'optimize-paths', 'version', 'help']
var ALIAS_OPTS = OPTIONS.reduce(function(alias, opt) {
  alias[opt[0]] = opt[1]

  return alias
}, {})

var printVersion = function() {
  console.log('gerber2svg version', VERSION)
}

var printBanner = function() {
  console.log(BANNER)
}

var printOptions = function() {
  OPTIONS.forEach(function(opt) {
    console.log('-' + opt[0] + ', --' + opt[1] + '  ' + opt[2])
  })
}

var printHelp = function() {
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
  return printVersion()
}

if (argv.help || (argv._.length === 0)) {
  return printHelp()
}

var error = function(string) {
  console.error(chalk.bold.red(string))
}

var warn = function(string) {
  if (!argv.quiet) {
    console.warn(chalk.bold.yellow(string))
  }
}

var info = function(string) {
  if (!argv.quiet) {
    console.info(chalk.bold.white(string))
  }
}

var getOpts = function(id) {
  var opts = {
    id: id,
    optimizePaths: argv['optimize-paths']
  }

  if (argv.color) {
    opts.color = argv.color
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

var convert = function(err) {
  if (err) {
    return error(err.message)
  }

  argv._.forEach(function processGerber(gerberFile) {
    var out = process.stdout
    var ext = (!argv.a) ? path.extname(gerberFile) : ''
    var base = path.basename(gerberFile, ext)

    if (argv.out) {
      var outFile = path.join(path.join(argv.out, base + '.svg'))

      out = fs.createWriteStream(outFile)
      out.on('finish', function() {
        info(gerberFile + ' converterted to ' + outFile)
      })
    }

    if (argv.pretty) {
      var indent = (argv.pretty === true) ? 2 : argv.pretty
      var originalOut = out

      out = xmlovely(indent)
      out.pipe(originalOut)
    }

    var gerberStream = fs.createReadStream(gerberFile)
    var converter = gerberToSvg(gerberStream, getOpts(base))

    converter.on('warning', function(w) {
      warn('warning at line ' + w.line + ' - ' + w.message)
    })

    converter.pipe(out)
  })
}

// create the outdir if necesary
// convert the files either way
if (argv.out) {
  return mkdir(argv.out, convert)
}

convert()
