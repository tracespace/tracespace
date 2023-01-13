import * as core from '@tracespace/core'

import {writeJson} from './output'

export interface PlotArgs {
  files: string[]
  output?: string
  layersOnly?: boolean
  parse?: boolean
}

export async function plot(args: PlotArgs): Promise<void> {
  const {files, output, layersOnly, parse} = args
  const readResult = await core.read(files)
  const plotResult = core.plot(readResult)

  const writeTasks = [
    ...plotResult.layers.flatMap(({id, filename}) => [
      writeJson({
        contents: readResult.parseTreesById[id],
        basename: `${filename}.parse`,
        directory: output,
        disable: !parse,
      }),
      writeJson({
        contents: plotResult.plotTreesById[id],
        basename: `${filename}.plot`,
        directory: output,
      }),
    ]),
    writeJson({
      contents: plotResult.boardShape,
      basename: 'board-shape.plot',
      directory: output,
      disable: layersOnly,
    }),
  ]

  await Promise.all(writeTasks)
}
