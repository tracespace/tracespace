import {read} from '@tracespace/core'

import {writeJson} from './output'

export interface ParseOptions {
  files: string[]
  output?: string
}

export async function parse(options: ParseOptions): Promise<void> {
  const {files, output} = options
  const readResult = await read(files)

  const writeTasks = readResult.layers.map(async ({id, filename}) => {
    await writeJson({
      contents: readResult.parseTreesById[id],
      basename: `${filename}.parse`,
      directory: output,
    })
  })

  await Promise.all(writeTasks)
}
