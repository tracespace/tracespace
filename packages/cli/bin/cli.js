#!/usr/bin/env node
import process from 'node:process'
import {hideBin} from 'yargs/helpers'
import {run} from '@tracespace/cli'

await run(hideBin(process.argv))
