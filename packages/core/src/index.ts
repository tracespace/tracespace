import {s} from 'hastscript'

import * as parser from '@tracespace/parser'
import * as plotter from '@tracespace/plotter'
import * as renderer from '@tracespace/renderer'
import {random as randomId} from '@tracespace/xml-id'
import {SIDE_TOP, SIDE_BOTTOM} from '@tracespace/identify-layers'

import type {GerberTree} from '@tracespace/parser'
import type {ImageTree} from '@tracespace/plotter'
import type {GerberType, GerberSide} from '@tracespace/identify-layers'
import type {SvgElement, ViewBox} from '@tracespace/renderer'

import {readFile} from './read-file'
import {determineLayerTypes} from './determine-layer-types'
import {plotBoardShape, renderBoardShape} from './board-shape'
import {getDrillLayers, getSideLayers} from './sort-layers'
import {stringifySvg} from './stringify-svg'

import type {ParsedLayer} from './determine-layer-types'
import type {BoardShape, BoardShapeRender} from './board-shape'
import type {Side, SideLayers} from './sort-layers'

export {stringifySvg} from './stringify-svg'

export interface Layer {
  id: string
  filename: string
  type: GerberType
  side: GerberSide
}

export interface ReadResult {
  layers: Layer[]
  parseTreesById: Record<string, GerberTree>
}

export interface PlotResult {
  layers: Layer[]
  plotTreesById: Record<string, ImageTree>
  boardShape: BoardShape
}

export interface RenderLayersResult {
  layers: Layer[]
  rendersById: Record<string, SvgElement>
  boardShapeRender: BoardShapeRender
}

export interface RenderBoardResult extends Record<Side, SvgElement> {}

export interface BoardShapeRenderFragment {
  viewBox: ViewBox
  svgFragment?: string
}

export interface RenderFragmentsResult {
  layers: Layer[]
  topLayers: SideLayers
  bottomLayers: SideLayers
  drillLayers: string[]
  boardShapeRenderFragment: BoardShapeRenderFragment
  svgFragmentsById: Record<string, string>
}

export async function read(files: File[] | string[]): Promise<ReadResult> {
  const readTasks = files.map(readAndParseFile)
  const parsedLayers = await Promise.all(readTasks)
  const layerTypesById = determineLayerTypes(parsedLayers)
  const layers: Layer[] = []
  const parseTreesById: Record<string, GerberTree> = {}

  for (const {id, filename, parseTree} of parsedLayers) {
    const {type, side} = layerTypesById[id]

    layers.push({id, filename, type, side})
    parseTreesById[id] = parseTree
  }

  return {layers, parseTreesById}
}

async function readAndParseFile(file: File | string): Promise<ParsedLayer> {
  const id = randomId()
  const {filename, contents} = await readFile(file)
  const parseTree = parser.parse(contents)

  return {id, filename, parseTree}
}

export function plot(readResult: ReadResult): PlotResult {
  const {layers, parseTreesById} = readResult
  const plotTreesById: Record<string, ImageTree> = {}

  for (const {id} of layers) {
    plotTreesById[id] = plotter.plot(parseTreesById[id])
  }

  const boardShape = plotBoardShape(layers, plotTreesById, 0.02)

  return {layers, plotTreesById, boardShape}
}

export function renderLayers(plotResult: PlotResult): RenderLayersResult {
  const {layers, boardShape, plotTreesById} = plotResult
  const boardShapeRender = renderBoardShape(boardShape)
  const rendersById: Record<string, SvgElement> = {}

  for (const {id} of layers) {
    rendersById[id] = renderer.render(
      plotTreesById[id],
      boardShapeRender.viewBox
    )
  }

  return {layers, rendersById, boardShapeRender}
}

export function renderBoard(
  renderLayersResult: RenderLayersResult
): RenderBoardResult {
  const {layers, rendersById, boardShapeRender} = renderLayersResult
  const {viewBox, path: shapeRender} = boardShapeRender
  const drillLayers = getDrillLayers(layers)

  const [x, y, width, height] = viewBox
  const result: Partial<RenderBoardResult> = {}

  const getRenderChildren = (id: string) => rendersById[id].children

  for (const side of [SIDE_TOP, SIDE_BOTTOM] as const) {
    const {
      copper: copperLayers,
      solderMask: resistLayers,
      silkScreen: silkLayers,
      solderPaste: pasteLayers,
    } = getSideLayers(side, layers)

    const id = randomId()
    const drillMaskId = `drill-${id}`
    const resistMaskId = `resist-${id}`
    const shapeClipId = `shape-${id}`

    const clipPath = shapeRender ? `url(#${shapeClipId})` : undefined
    const transform =
      side === SIDE_BOTTOM
        ? `translate(${2 * x + width},0) scale(-1,1)`
        : undefined

    result[side] = s(
      'svg',
      {
        ...renderer.BASE_SVG_PROPS,
        ...renderer.BASE_IMAGE_PROPS,
        viewBox: `${x} ${y} ${width} ${height}`,
      },
      [
        s('defs', [
          s('mask', {id: drillMaskId}, [
            s('rect', {x, y, width, height, fill: '#fff'}),
            s('g', {color: '#000'}, drillLayers.flatMap(getRenderChildren)),
          ]),
          s('mask', {id: resistMaskId}, [
            s('rect', {x, y, width, height, fill: '#fff'}),
            s('g', {color: '#000'}, resistLayers.flatMap(getRenderChildren)),
          ]),
          shapeRender
            ? s('clipPath', {id: shapeClipId}, shapeRender)
            : undefined,
        ]),
        s('g', {transform, 'clip-path': clipPath}, [
          s('g', {mask: `url(#${drillMaskId})`}, [
            s('rect', {fill: '#666', x, y, width, height}),
            s('g', {color: '#c93'}, copperLayers.flatMap(getRenderChildren)),
          ]),
          s('g', {mask: `url(#${resistMaskId})`}, [
            s('rect', {fill: '#004200', opacity: '0.8', x, y, width, height}),
            s('g', {color: '#fff'}, silkLayers.flatMap(getRenderChildren)),
          ]),
          s('g', {color: '#999'}, pasteLayers.flatMap(getRenderChildren)),
        ]),
      ]
    )
  }

  return result as RenderBoardResult
}

export function renderFragments(plotResult: PlotResult): RenderFragmentsResult {
  const {layers, plotTreesById, boardShape} = plotResult
  const {viewBox, path: boardShapePath} = renderBoardShape(boardShape)
  const topLayers = getSideLayers(SIDE_TOP, layers)
  const bottomLayers = getSideLayers(SIDE_BOTTOM, layers)
  const drillLayers = getDrillLayers(layers)
  const boardShapeRenderFragment = {
    viewBox,
    svgFragment: boardShapePath ? stringifySvg(boardShapePath) : undefined,
  }

  const svgFragmentsById: Record<string, string> = {}

  for (const {id} of layers) {
    svgFragmentsById[id] = stringifySvg(
      renderer.renderFragment(plotTreesById[id])
    )
  }

  return {
    layers,
    topLayers,
    bottomLayers,
    drillLayers,
    boardShapeRenderFragment,
    svgFragmentsById,
  }
}
