#!/usr/bin/env node
'use strict'

const cosmiconfig = require('cosmiconfig')
const yargs = require('yargs')
const debug = require('debug')('@tracespace/cli')
const cli = require('./lib/cli')

debug('Searching for default config')

cosmiconfig('tracespace')
  .search()
  .then(rc => {
    debug('default config', rc)
    return rc ? Object.assign({_configFile: rc.filepath}, rc.config) : {}
  })
  .then(config => {
    const argv = process.argv.slice(2)
    debug('argv', argv)
    return cli(argv, config)
  })
  .then(
    () => {
      debug('cli ran successfully')
      process.exit(0)
    },
    error => {
      console.error(`Error: ${error.message}\n\nUsage:`)
      yargs.showHelp()
      process.exit(1)
    }
  )
