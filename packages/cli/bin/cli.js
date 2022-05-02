#!/usr/bin/env node
import process from 'node:process'

import cosmiconfig from 'cosmiconfig'
import yargs from 'yargs'
import createLogger from 'debug'
import {cli} from '@tracespace/cli'

const debug = createLogger('@tracespace/cli')

debug('Searching for default config')

cosmiconfig('tracespace')
  .search()
  .then(rc => {
    debug('default config', rc)
    return rc ? {_configFile: rc.filepath, ...rc.config} : {}
  })
  .then(config => {
    const argv = process.argv.slice(2)
    debug('argv', argv)
    return cli(argv, config)
  })
  .then(
    () => {
      debug('cli ran successfully')
      process.exitCode = 0
    },
    error => {
      console.error(`Error: ${error.message}\n\nUsage:`)
      yargs.showHelp()
      process.exitCode = 1
    }
  )
