import fs from 'node:fs/promises'
import path from 'node:path'
import process from 'node:process'

import {Command, CommanderError, createCommand} from 'commander'
import {toHtml} from 'hast-util-to-html'

import {createParser} from '@tracespace/parser'
import {plot} from '@tracespace/plotter'
import {render} from '@tracespace/renderer'

type Logger = Pick<Console, 'info' | 'warn' | 'error'>

export interface Options {
  logger?: Logger
}

export interface Result {
  exitCode: number
}

export async function run(args: string[], options?: Options): Promise<Result> {
  const {logger = console} = options ?? {}
  const program = createProgram(logger)

  return program
    .parseAsync(args)
    .then(() => ({exitCode: 0}))
    .catch((error: unknown) => {
      if (error instanceof CommanderError) {
        return {exitCode: error.exitCode}
      }

      throw error
    })
}

interface RenderCommandOptions {
  out?: string
  debug?: boolean
}

function createProgram(log: Logger): Command {
  const program = createCommand()

  program
    .configureOutput({writeOut: log.info, writeErr: log.error})
    .exitOverride()

  program
    .name('tracespace')
    .description(__PKG_DESCRIPTION__)
    .version(__PKG_VERSION__)

  program
    .command('render')
    .argument('<files...>')
    .option('-o, --out <output_directory>', 'Location to save renders')
    .option('-d, --debug', 'Output parse and plot trees for debugging')
    .action(
      async (files: string[], options: RenderCommandOptions): Promise<void> => {
        const renderTasks = files.map(async inputFilename => {
          return createRenderTask(inputFilename, options)
        })

        return Promise.all(renderTasks).then(allTaskFilenames => {
          for (const filename of allTaskFilenames.flat()) {
            log.info(`Wrote: ${filename}`)
          }
        })
      }
    )

  return program
}

async function createRenderTask(
  inputFilename: string,
  options: RenderCommandOptions
): Promise<string[]> {
  const {out = process.cwd(), debug = false} = options
  const outputFilenameBase = path.join(out, path.basename(inputFilename))

  const writeFile = async (
    filename: string,
    contents: string
  ): Promise<string> => {
    return fs.writeFile(filename, contents, 'utf8').then(() => filename)
  }

  return fs
    .mkdir(out, {recursive: true})
    .then(async () => fs.readFile(inputFilename, 'utf8'))
    .then(async contents => {
      const parseTree = createParser().feed(contents).result()
      const plotTree = plot(parseTree)
      const renderTree = render(plotTree)
      const renderHtml = toHtml(renderTree)
      const writeTasks = [writeFile(`${outputFilenameBase}.svg`, renderHtml)]

      if (debug) {
        writeTasks.push(
          writeFile(
            `${outputFilenameBase}.parse.json`,
            JSON.stringify(parseTree, null, 2)
          ),
          writeFile(
            `${outputFilenameBase}.plot.json`,
            JSON.stringify(plotTree, null, 2)
          )
        )
      }

      return Promise.all(writeTasks)
    })
}
