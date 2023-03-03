// @vitest-environment jsdom
import {describe, beforeEach, afterEach, it, expect} from 'vitest'
import {replaceEsm, reset} from 'testdouble-vitest'
import * as td from 'testdouble'

import {TYPE_COPPER, SIDE_TOP} from '@tracespace/identify-layers'
import {ROOT} from '@tracespace/parser'
import type {GerberTree} from '@tracespace/parser'
import {IMAGE} from '@tracespace/plotter'
import type {ImageTree} from '@tracespace/plotter'

import {INITIAL_RENDER} from '../actions'

const parseTree = {type: ROOT} as GerberTree
const plotTree = {type: IMAGE} as ImageTree
const layerType = {type: TYPE_COPPER, side: SIDE_TOP} as const

describe('render worker', () => {
  let core: typeof import('@tracespace/core')
  let subject: typeof import('../worker')

  beforeEach(async () => {
    core = await replaceEsm('@tracespace/core')
    subject = await import('../worker')
  })

  afterEach(() => {
    reset()
  })

  it('should read and render files', async () => {
    const files = [new File(['foo'], 'foo.gbr')]

    td.when(core.read(files)).thenResolve({
      layers: [{id: 'id-1', filename: 'foo.gbr', ...layerType}],
      parseTreesById: {'id-1': parseTree},
    })

    td.when(
      core.plot({
        layers: [{id: 'id-1', filename: 'foo.gbr', ...layerType}],
        parseTreesById: {'id-1': parseTree},
      })
    ).thenReturn({
      layers: [{id: 'id-1', filename: 'foo.gbr', ...layerType}],
      size: [1, 2, 3, 4],
      plotTreesById: {'id-1': plotTree},
    })

    td.when(
      core.renderFragments({
        layers: [{id: 'id-1', filename: 'foo.gbr', ...layerType}],
        size: [1, 2, 3, 4],
        plotTreesById: {'id-1': plotTree},
      })
    ).thenReturn({
      layers: [{id: 'id-1', filename: 'foo.gbr', ...layerType}],
      topLayers: {
        copper: ['id-1'],
        solderMask: [],
        silkScreen: [],
        solderPaste: [],
      },
      bottomLayers: {
        copper: [],
        solderMask: [],
        silkScreen: [],
        solderPaste: [],
      },
      mechanicalLayers: {drill: [], outline: undefined},
      outlineRender: {svgFragment: '<g id="outline"/>', viewBox: [5, 6, 7, 8]},
      svgFragmentsById: {'id-1': '<g id="1"/>'},
    })

    const result = await subject.call({type: INITIAL_RENDER, files})

    expect(result).to.eql({
      layers: [{id: 'id-1', filename: 'foo.gbr', ...layerType}],
      topLayers: {
        copper: ['id-1'],
        solderMask: [],
        silkScreen: [],
        solderPaste: [],
      },
      bottomLayers: {
        copper: [],
        solderMask: [],
        silkScreen: [],
        solderPaste: [],
      },
      mechanicalLayers: {drill: [], outline: undefined},
      outlineRender: {svgFragment: '<g id="outline"/>', viewBox: [5, 6, 7, 8]},
      svgFragmentsById: {'id-1': '<g id="1"/>'},
    })
  })
})
