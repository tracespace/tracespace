import {read} from '@tracespace/core'

import {writeJson} from './output'

export interface ParseArgs {
  files: string[]
  output?: string
}

export async function parse(args: ParseArgs): Promise<void> {
  const {files, output} = args
  const readResult = await read(files)

  const writeTasks = readResult.layers.map(async ({id, filename}) =>
    writeJson({
      contents: readResult.parseTreesById[id],
      basename: `${filename}.parse`,
      directory: output,
    })
  )

  await Promise.all(writeTasks)
}
