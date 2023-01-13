import {describe, it, beforeEach, afterEach} from 'vitest'
import {replaceEsm, reset} from 'testdouble-vitest'
import * as td from 'testdouble'

describe('tracespace CLI parse command', () => {
  let core: typeof import('@tracespace/core')
  let subject: typeof import('../parse')
  let output: typeof import('../output')

  beforeEach(async () => {
    core = await replaceEsm('@tracespace/core')
    output = await replaceEsm('../output')
    subject = await import('../parse')
  })

  afterEach(() => {
    reset()
  })

  it('should parse files and write them to a directory', async () => {
    td.when(core.read(['./path/to/gerber.gbr'])).thenResolve({
      layers: [
        {id: 'layer1', filename: 'file1.gbr', type: 'drawing', side: 'all'},
        {id: 'layer2', filename: 'file2.gbr', type: 'drawing', side: 'all'},
      ],
      parseTreesById: {
        layer1: {type: 'root', filetype: 'gerber', children: []},
        layer2: {type: 'root', filetype: 'drill', children: []},
      },
    })

    await subject.parse({
      files: ['./path/to/gerber.gbr'],
      output: './path/to/output',
    })

    td.verify(
      output.writeJson({
        basename: 'file1.gbr.parse',
        directory: './path/to/output',
        contents: {type: 'root', filetype: 'gerber', children: []},
      }),
      {times: 1}
    )

    td.verify(
      output.writeJson({
        basename: 'file2.gbr.parse',
        directory: './path/to/output',
        contents: {type: 'root', filetype: 'drill', children: []},
      }),
      {times: 1}
    )
  })
})
