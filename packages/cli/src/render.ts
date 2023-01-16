import * as core from '@tracespace/core'

import {writeJson, writeSvg} from './output'

export interface RenderArgs {
  files: string[]
  output?: string
  layersOnly?: boolean
  boardOnly?: boolean
  parse?: boolean
  plot?: boolean
}

export async function render(args: RenderArgs): Promise<void> {
  const {files, output, parse, plot, layersOnly, boardOnly} = args
  const readResult = await core.read(files)
  const plotResult = core.plot(readResult)
  const renderLayersResult = core.renderLayers(plotResult)
  const renderBoardResult = core.renderBoard(renderLayersResult)

  const writeTasks = [
    writeSvg({
      contents: renderBoardResult.top,
      basename: 'top',
      directory: output,
      disable: layersOnly,
    }),
    writeSvg({
      contents: renderBoardResult.bottom,
      basename: 'bottom',
      directory: output,
      disable: layersOnly,
    }),
    writeJson({
      contents: plotResult.boardShape,
      basename: 'board-shape.plot',
      directory: output,
      disable: !plot,
    }),
    ...plotResult.layers.flatMap(({id, filename}) => [
      writeJson({
        basename: `${filename}.parse`,
        directory: output,
        contents: readResult.parseTreesById[id],
        disable: !parse,
      }),
      writeJson({
        basename: `${filename}.plot`,
        directory: output,
        contents: plotResult.plotTreesById[id],
        disable: !plot,
      }),
      writeSvg({
        basename: filename,
        directory: output,
        contents: renderLayersResult.rendersById[id],
        disable: boardOnly,
      }),
    ]),
  ]

  await Promise.all(writeTasks)
}
