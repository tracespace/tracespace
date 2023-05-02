// @vitest-environment jsdom
import {describe, beforeEach, afterEach, it, expect} from 'vitest'
import {replaceEsm, reset} from 'testdouble-vitest'
import * as td from 'testdouble'

import {
  TYPE_COPPER,
  TYPE_OUTLINE,
  SIDE_ALL,
  SIDE_TOP,
} from '@tracespace/identify-layers'

import type {GerberTree} from '@tracespace/parser'
import type {ImageTree} from '@tracespace/plotter'
import type {SvgElement} from '@tracespace/renderer'
import type {LayerIdentity} from '@tracespace/identify-layers'

import type {ReadResult, PlotResult} from '..'
import type {BoardShape, BoardShapeRender} from '../board-shape'

describe('tracespace core', () => {
  let parser: typeof import('@tracespace/parser')
  let plotter: typeof import('@tracespace/plotter')
  let renderer: typeof import('@tracespace/renderer')
  let xmlId: typeof import('@tracespace/xml-id')
  let fileReader: typeof import('../read-file')
  let layerTypeDeterminer: typeof import('../determine-layer-types')
  let boardShapePlotter: typeof import('../board-shape')
  let svgStringifier: typeof import('../stringify-svg')
  let layerSorter: typeof import('../sort-layers')
  let subject: typeof import('..')

  beforeEach(async () => {
    parser = await replaceEsm('@tracespace/parser')
    plotter = await replaceEsm('@tracespace/plotter')
    renderer = await replaceEsm('@tracespace/renderer')
    xmlId = await replaceEsm('@tracespace/xml-id')
    fileReader = await replaceEsm('../read-file')
    layerTypeDeterminer = await replaceEsm('../determine-layer-types')
    boardShapePlotter = await replaceEsm('../board-shape')
    svgStringifier = await replaceEsm('../stringify-svg')
    layerSorter = await replaceEsm('../sort-layers')
    subject = await import('..')
  })

  afterEach(() => {
    reset()
  })

  it('should read a set of files', async () => {
    const files = [new File(['foo'], 'foo.gbr'), new File(['bar'], 'bar.gbr')]

    const parseTreeFoo = {
      type: parser.ROOT,
      filetype: parser.GERBER,
    } as GerberTree

    const parseTreeBar = {
      type: parser.ROOT,
      filetype: parser.DRILL,
    } as GerberTree

    const layerTypes: Record<string, LayerIdentity> = {
      'id-foo': {type: TYPE_COPPER, side: SIDE_TOP},
      'id-bar': {type: TYPE_OUTLINE, side: SIDE_ALL},
    }

    td.when(xmlId.random()).thenReturn('id-foo', 'id-bar', '')
    td.when(fileReader.readFile(files[0])).thenResolve({
      filename: 'foo.gbr',
      contents: 'hello from',
    })
    td.when(fileReader.readFile(files[1])).thenResolve({
      filename: 'bar.gbr',
      contents: 'the other side',
    })
    td.when(parser.parse('hello from')).thenReturn(parseTreeFoo)
    td.when(parser.parse('the other side')).thenReturn(parseTreeBar)
    td.when(
      layerTypeDeterminer.determineLayerTypes([
        {id: 'id-foo', filename: 'foo.gbr', parseTree: parseTreeFoo},
        {id: 'id-bar', filename: 'bar.gbr', parseTree: parseTreeBar},
      ])
    ).thenReturn(layerTypes)

    const result = await subject.read(files)

    expect(result).to.eql({
      layers: [
        {id: 'id-foo', filename: 'foo.gbr', type: TYPE_COPPER, side: SIDE_TOP},
        {id: 'id-bar', filename: 'bar.gbr', type: TYPE_OUTLINE, side: SIDE_ALL},
      ],
      parseTreesById: {'id-foo': parseTreeFoo, 'id-bar': parseTreeBar},
    })
  })

  it('should plot a set of read and parsed layers', () => {
    const parseTreeFoo = {
      type: parser.ROOT,
      filetype: parser.GERBER,
    } as GerberTree

    const parseTreeBar = {
      type: parser.ROOT,
      filetype: parser.DRILL,
    } as GerberTree

    const readResult: ReadResult = {
      layers: [
        {id: 'id-foo', filename: 'foo.gbr', type: TYPE_COPPER, side: SIDE_TOP},
        {id: 'id-bar', filename: 'bar.gbr', type: TYPE_OUTLINE, side: SIDE_ALL},
      ],
      parseTreesById: {'id-foo': parseTreeFoo, 'id-bar': parseTreeBar},
    }

    const plotTreeFoo: ImageTree = {
      type: plotter.IMAGE,
      units: parser.MM,
      size: [],
      children: [],
      tools: {},
    }

    const plotTreeBar: ImageTree = {
      type: plotter.IMAGE,
      units: parser.IN,
      size: [],
      children: [],
      tools: {},
    }

    td.when(plotter.plot(parseTreeFoo)).thenReturn(plotTreeFoo)
    td.when(plotter.plot(parseTreeBar)).thenReturn(plotTreeBar)
    td.when(
      boardShapePlotter.plotBoardShape(
        readResult.layers,
        {'id-foo': plotTreeFoo, 'id-bar': plotTreeBar},
        0.02
      )
    ).thenReturn({size: [1, 2, 3, 4], regions: [], openPaths: []})

    const result = subject.plot(readResult)

    expect(result).to.eql({
      layers: [
        {id: 'id-foo', filename: 'foo.gbr', type: TYPE_COPPER, side: SIDE_TOP},
        {id: 'id-bar', filename: 'bar.gbr', type: TYPE_OUTLINE, side: SIDE_ALL},
      ],
      plotTreesById: {'id-foo': plotTreeFoo, 'id-bar': plotTreeBar},
      boardShape: {size: [1, 2, 3, 4], regions: [], openPaths: []},
    })
  })

  it('should render a set of plotted layers', () => {
    const plotTreeFoo = {type: plotter.IMAGE, units: parser.MM} as ImageTree
    const plotTreeBar = {type: plotter.IMAGE, units: parser.IN} as ImageTree
    const boardShape: BoardShape = {
      size: [1, 2, 3, 4],
      regions: [],
      openPaths: [],
    }
    const plotResult: PlotResult = {
      layers: [
        {id: 'id-foo', filename: 'foo.gbr', type: TYPE_COPPER, side: SIDE_TOP},
        {id: 'id-bar', filename: 'bar.gbr', type: TYPE_OUTLINE, side: SIDE_ALL},
      ],
      plotTreesById: {'id-foo': plotTreeFoo, 'id-bar': plotTreeBar},
      boardShape,
    }

    const svgTreeFoo: SvgElement = {
      type: 'element',
      tagName: 'foo',
      children: [],
    }

    const svgTreeBar: SvgElement = {
      type: 'element',
      tagName: 'bar',
      children: [],
    }

    const drillLayers = ['id-foo']

    const topLayers = {
      copper: ['id-foo'],
      solderMask: ['id-foo'],
      silkScreen: ['id-foo'],
      solderPaste: ['id-foo'],
    }

    const bottomLayers = {
      copper: ['id-bar'],
      solderMask: ['id-bar'],
      silkScreen: ['id-bar'],
      solderPaste: ['id-bar'],
    }

    const boardShapeRender: BoardShapeRender = {
      viewBox: [5, 6, 7, 8],
      path: {type: 'element', tagName: 'path', children: []},
    }

    td.when(renderer.renderFragment(plotTreeFoo)).thenReturn(svgTreeFoo)
    td.when(renderer.renderFragment(plotTreeBar)).thenReturn(svgTreeBar)
    td.when(svgStringifier.stringifySvg(svgTreeFoo)).thenReturn('<g id="foo"/>')
    td.when(svgStringifier.stringifySvg(svgTreeBar)).thenReturn('<g id="bar"/>')
    td.when(svgStringifier.stringifySvg(boardShapeRender.path!)).thenReturn(
      '<path id="shape"/>'
    )
    td.when(layerSorter.getDrillLayers(plotResult.layers)).thenReturn(
      drillLayers
    )
    td.when(layerSorter.getSideLayers('top', plotResult.layers)).thenReturn(
      topLayers
    )
    td.when(layerSorter.getSideLayers('bottom', plotResult.layers)).thenReturn(
      bottomLayers
    )
    td.when(boardShapePlotter.renderBoardShape(boardShape)).thenReturn(
      boardShapeRender
    )

    const result = subject.renderFragments(plotResult)

    expect(result).to.eql({
      layers: plotResult.layers,
      topLayers,
      bottomLayers,
      drillLayers,
      boardShapeRenderFragment: {
        viewBox: [5, 6, 7, 8],
        svgFragment: '<path id="shape"/>',
      },
      svgFragmentsById: {
        'id-foo': '<g id="foo"/>',
        'id-bar': '<g id="bar"/>',
      },
    })
  })
})
