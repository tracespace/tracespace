import {describe, it, beforeEach, afterEach} from 'vitest'
import {replaceEsm, reset} from 'testdouble-vitest'
import * as td from 'testdouble'

import type {ImageTree} from '@tracespace/plotter'
import type {
  Layer,
  ReadResult,
  PlotResult,
  RenderLayersResult,
  RenderBoardResult,
} from '@tracespace/core'

const layers: Layer[] = [
  {id: 'layer1', filename: 'file1.gbr', type: 'drawing', side: 'all'},
  {id: 'layer2', filename: 'file2.gbr', type: 'drawing', side: 'all'},
]

const readResult: ReadResult = {
  layers,
  parseTreesById: {
    layer1: {type: 'root', filetype: 'gerber', children: []},
    layer2: {type: 'root', filetype: 'drill', children: []},
  },
}

const plotResult: PlotResult = {
  layers,
  plotTreesById: {
    layer1: {type: 'image', units: 'mm'} as ImageTree,
    layer2: {type: 'image', units: 'in'} as ImageTree,
  },
  boardShape: {size: [1, 2, 3, 4], regions: [], openPaths: []},
}

const renderLayersResult: RenderLayersResult = {
  layers,
  rendersById: {
    layer1: {type: 'element', tagName: 'foo', children: []},
    layer2: {type: 'element', tagName: 'bar', children: []},
  },
  boardShapeRender: {
    viewBox: [5, 6, 7, 8],
    path: {type: 'element', tagName: 'path', children: []},
  },
}

const renderBoardResult: RenderBoardResult = {
  top: {type: 'element', tagName: 'svg-top', children: []},
  bottom: {type: 'element', tagName: 'svg-bottom', children: []},
}

describe('tracespace CLI render command', () => {
  let core: typeof import('@tracespace/core')
  let output: typeof import('../output')
  let subject: typeof import('../render')

  beforeEach(async () => {
    core = await replaceEsm('@tracespace/core')
    output = await replaceEsm('../output')
    subject = await import('../render')

    td.when(core.read(['./path/to/gerber.gbr'])).thenResolve(readResult)
    td.when(core.plot(readResult)).thenReturn(plotResult)
    td.when(core.renderLayers(plotResult)).thenReturn(renderLayersResult)
    td.when(core.renderBoard(renderLayersResult)).thenReturn(renderBoardResult)
  })

  afterEach(() => {
    reset()
  })

  it('should render layers and board and write them to a directory', async () => {
    await subject.render({
      files: ['./path/to/gerber.gbr'],
      output: './path/to/output',
    })

    td.verify(
      output.writeJson(
        td.matchers.contains({basename: 'file1.gbr.parse', disable: true})
      ),
      {times: 1}
    )

    td.verify(
      output.writeJson(
        td.matchers.contains({basename: 'file2.gbr.parse', disable: true})
      ),
      {times: 1}
    )

    td.verify(
      output.writeJson(
        td.matchers.contains({basename: 'file1.gbr.plot', disable: true})
      ),
      {times: 1}
    )

    td.verify(
      output.writeJson(
        td.matchers.contains({basename: 'file2.gbr.plot', disable: true})
      ),
      {times: 1}
    )

    td.verify(
      output.writeJson(
        td.matchers.contains({basename: 'board-shape.plot', disable: true})
      ),
      {times: 1}
    )

    td.verify(
      output.writeSvg({
        basename: 'file1.gbr',
        directory: './path/to/output',
        contents: {type: 'element', tagName: 'foo', children: []},
        disable: undefined,
      }),
      {times: 1}
    )

    td.verify(
      output.writeSvg({
        basename: 'file2.gbr',
        directory: './path/to/output',
        contents: {type: 'element', tagName: 'bar', children: []},
        disable: undefined,
      }),
      {times: 1}
    )

    td.verify(
      output.writeSvg({
        basename: 'top',
        directory: './path/to/output',
        contents: {type: 'element', tagName: 'svg-top', children: []},
        disable: undefined,
      }),
      {times: 1}
    )

    td.verify(
      output.writeSvg({
        basename: 'bottom',
        directory: './path/to/output',
        contents: {type: 'element', tagName: 'svg-bottom', children: []},
        disable: undefined,
      }),
      {times: 1}
    )
  })

  it('should optionally write the parse and plot trees, too', async () => {
    await subject.render({
      files: ['./path/to/gerber.gbr'],
      output: './path/to/output',
      parse: true,
      plot: true,
    })

    td.verify(
      output.writeJson({
        basename: 'file1.gbr.parse',
        directory: './path/to/output',
        contents: {type: 'root', filetype: 'gerber', children: []},
        disable: false,
      }),
      {times: 1}
    )

    td.verify(
      output.writeJson({
        basename: 'file1.gbr.plot',
        directory: './path/to/output',
        contents: {type: 'image', units: 'mm'},
        disable: false,
      }),
      {times: 1}
    )

    td.verify(
      output.writeJson({
        basename: 'board-shape.plot',
        directory: './path/to/output',
        contents: {size: [1, 2, 3, 4], regions: [], openPaths: []},
        disable: false,
      }),
      {times: 1}
    )

    td.verify(
      output.writeSvg(
        td.matchers.contains({basename: 'file1.gbr', disable: undefined})
      ),
      {times: 1}
    )

    td.verify(
      output.writeSvg(
        td.matchers.contains({basename: 'top', disable: undefined})
      ),
      {times: 1}
    )
  })

  it('should render only the board views', async () => {
    await subject.render({
      files: ['./path/to/gerber.gbr'],
      output: './path/to/output',
      boardOnly: true,
    })

    td.verify(
      output.writeSvg(
        td.matchers.contains({basename: 'file1.gbr', disable: true})
      ),
      {times: 1}
    )

    td.verify(
      output.writeSvg(
        td.matchers.contains({basename: 'top', disable: undefined})
      ),
      {times: 1}
    )

    td.verify(
      output.writeSvg(
        td.matchers.contains({basename: 'bottom', disable: undefined})
      ),
      {times: 1}
    )
  })

  it('should render only the layers', async () => {
    await subject.render({
      files: ['./path/to/gerber.gbr'],
      output: './path/to/output',
      layersOnly: true,
    })

    td.verify(
      output.writeSvg(
        td.matchers.contains({basename: 'file1.gbr', disable: undefined})
      ),
      {times: 1}
    )

    td.verify(
      output.writeSvg(td.matchers.contains({basename: 'top', disable: true})),
      {times: 1}
    )

    td.verify(
      output.writeSvg(
        td.matchers.contains({basename: 'bottom', disable: true})
      ),
      {times: 1}
    )
  })
})
