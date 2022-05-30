#!/usr/bin/env node
import process from 'node:process'
import {run} from '@tracespace/cli'

run(process.argv)
  .then(({exitCode}) => {
    process.exitCode = exitCode
  })
  .catch(error => {
    console.error('Unexpected error', error)
    process.exitCode = 500
  })
