import {describe, beforeEach, afterEach, it, expect} from 'vitest'
import {replaceEsm, reset} from 'testdouble-vitest'
import * as td from 'testdouble'

import {ROOT, DRILL, GERBER} from '@tracespace/parser'

describe('determine layer type', () => {
  let layerIdentifier: typeof import('@tracespace/identify-layers')
  let subject: typeof import('../determine-layer-types')

  beforeEach(async () => {
    layerIdentifier = await replaceEsm('@tracespace/identify-layers')
    subject = await import('../determine-layer-types')
  })

  afterEach(() => {
    reset()
  })

  it('should return an empty object given no input', () => {
    const result = subject.determineLayerTypes([])
    expect(result).to.eql({})
  })

  it('should mark drill trees as drill files', () => {
    const result = subject.determineLayerTypes([
      {
        id: 'abc',
        filename: 'abc.gbr',
        parseTree: {type: ROOT, filetype: DRILL, children: []},
      },
      {
        id: 'def',
        filename: 'def.gbr',
        parseTree: {type: ROOT, filetype: DRILL, children: []},
      },
    ])

    expect(result).to.eql({
      abc: {type: layerIdentifier.TYPE_DRILL, side: layerIdentifier.SIDE_ALL},
      def: {type: layerIdentifier.TYPE_DRILL, side: layerIdentifier.SIDE_ALL},
    })
  })

  it('should identify other layers by filename', () => {
    td.when(layerIdentifier.identifyLayers(['abc.gbr', 'def.gbr'])).thenReturn({
      'abc.gbr': {
        type: layerIdentifier.TYPE_COPPER,
        side: layerIdentifier.SIDE_TOP,
      },
      'def.gbr': {
        type: layerIdentifier.TYPE_COPPER,
        side: layerIdentifier.SIDE_BOTTOM,
      },
    })

    const result = subject.determineLayerTypes([
      {
        id: 'abc',
        filename: 'abc.gbr',
        parseTree: {type: ROOT, filetype: GERBER, children: []},
      },
      {
        id: 'def',
        filename: 'def.gbr',
        parseTree: {type: ROOT, filetype: GERBER, children: []},
      },
      {
        id: 'ghi',
        filename: 'ghi.gbr',
        parseTree: {type: ROOT, filetype: DRILL, children: []},
      },
    ])

    expect(result).to.eql({
      abc: {type: layerIdentifier.TYPE_COPPER, side: layerIdentifier.SIDE_TOP},
      def: {
        type: layerIdentifier.TYPE_COPPER,
        side: layerIdentifier.SIDE_BOTTOM,
      },
      ghi: {type: layerIdentifier.TYPE_DRILL, side: layerIdentifier.SIDE_ALL},
    })
  })
})
