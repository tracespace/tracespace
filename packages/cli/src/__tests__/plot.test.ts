import {describe, it, beforeEach, afterEach} from 'vitest'
import {replaceEsm, reset} from 'testdouble-vitest'
import * as td from 'testdouble'

import type {ImageTree} from '@tracespace/plotter'
import type {ReadResult, PlotResult} from '@tracespace/core'

describe('tracespace CLI plot command', () => {
  let core: typeof import('@tracespace/core')
  let output: typeof import('../output')
  let subject: typeof import('../plot')

  beforeEach(async () => {
    core = await replaceEsm('@tracespace/core')
    output = await replaceEsm('../output')
    subject = await import('../plot')
  })

  afterEach(() => {
    reset()
  })

  it('should plot files and write them to a directory', async () => {
    const readResult: ReadResult = {
      layers: [
        {id: 'layer1', filename: 'file1.gbr', type: 'drawing', side: 'all'},
        {id: 'layer2', filename: 'file2.gbr', type: 'drawing', side: 'all'},
      ],
      parseTreesById: {
        layer1: {type: 'root', filetype: 'gerber', children: []},
        layer2: {type: 'root', filetype: 'drill', children: []},
      },
    }
    const plotResult: PlotResult = {
      layers: [
        {id: 'layer1', filename: 'file1.gbr', type: 'drawing', side: 'all'},
        {id: 'layer2', filename: 'file2.gbr', type: 'drawing', side: 'all'},
      ],
      plotTreesById: {
        layer1: {type: 'image', units: 'mm'} as ImageTree,
        layer2: {type: 'image', units: 'in'} as ImageTree,
      },
      boardShape: {size: [1, 2, 3, 4], regions: [], openPaths: []},
    }

    td.when(core.read(['./path/to/gerber.gbr'])).thenResolve(readResult)
    td.when(core.plot(readResult)).thenReturn(plotResult)

    await subject.plot({
      files: ['./path/to/gerber.gbr'],
      output: './path/to/output',
    })

    td.verify(
      output.writeJson({
        basename: 'file1.gbr.plot',
        directory: './path/to/output',
        contents: {type: 'image', units: 'mm'},
      }),
      {times: 1}
    )

    td.verify(
      output.writeJson({
        basename: 'file2.gbr.plot',
        directory: './path/to/output',
        contents: {type: 'image', units: 'in'},
      }),
      {times: 1}
    )

    td.verify(
      output.writeJson({
        basename: 'file1.gbr.parse',
        directory: './path/to/output',
        contents: {type: 'root', filetype: 'gerber', children: []},
        disable: true,
      }),
      {times: 1}
    )

    td.verify(
      output.writeJson({
        basename: 'file2.gbr.parse',
        directory: './path/to/output',
        contents: {type: 'root', filetype: 'drill', children: []},
        disable: true,
      }),
      {times: 1}
    )

    td.verify(
      output.writeJson({
        basename: 'board-shape.plot',
        directory: './path/to/output',
        contents: {size: [1, 2, 3, 4], regions: [], openPaths: []},
        disable: undefined,
      }),
      {times: 1}
    )
  })

  it('should optionally write the parse trees, too', async () => {
    const readResult: ReadResult = {
      layers: [
        {id: 'layer1', filename: 'file1.gbr', type: 'drawing', side: 'all'},
      ],
      parseTreesById: {
        layer1: {type: 'root', filetype: 'gerber', children: []},
      },
    }
    const plotResult: PlotResult = {
      layers: [
        {id: 'layer1', filename: 'file1.gbr', type: 'drawing', side: 'all'},
      ],
      plotTreesById: {
        layer1: {type: 'image', units: 'mm'} as ImageTree,
      },
      boardShape: {size: [1, 2, 3, 4], regions: [], openPaths: []},
    }

    td.when(core.read(['./path/to/gerber.gbr'])).thenResolve(readResult)
    td.when(core.plot(readResult)).thenReturn(plotResult)

    await subject.plot({
      files: ['./path/to/gerber.gbr'],
      output: './path/to/output',
      parse: true,
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
      }),
      {times: 1}
    )
  })

  it('should be able to skip the board shape', async () => {
    const readResult: ReadResult = {
      layers: [
        {id: 'layer1', filename: 'file1.gbr', type: 'drawing', side: 'all'},
      ],
      parseTreesById: {
        layer1: {type: 'root', filetype: 'gerber', children: []},
      },
    }
    const plotResult: PlotResult = {
      layers: [
        {id: 'layer1', filename: 'file1.gbr', type: 'drawing', side: 'all'},
      ],
      plotTreesById: {
        layer1: {type: 'image', units: 'mm'} as ImageTree,
      },
      boardShape: {size: [1, 2, 3, 4], regions: [], openPaths: []},
    }

    td.when(core.read(['./path/to/gerber.gbr'])).thenResolve(readResult)
    td.when(core.plot(readResult)).thenReturn(plotResult)

    await subject.plot({
      files: ['./path/to/gerber.gbr'],
      output: './path/to/output',
      layersOnly: true,
    })

    td.verify(
      output.writeJson(
        td.matchers.contains({basename: 'board-shape.plot', disable: true})
      ),
      {times: 1}
    )
  })
})
