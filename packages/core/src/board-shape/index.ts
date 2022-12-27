import {IMAGE_PATH, IMAGE_REGION, BoundingBox} from '@tracespace/plotter'
import {renderGraphic, sizeToViewBox} from '@tracespace/renderer'

import type {
  ImageTree,
  ImagePath,
  ImageRegion,
  SizeEnvelope,
} from '@tracespace/plotter'
import type {SvgElement, ViewBox} from '@tracespace/renderer'

import type {Layer} from '..'
import {getOutlineLayer} from '../sort-layers'
import {walkPaths} from './walk-paths'
import {fillGaps} from './fill-gaps'

export const MISSING_OUTLINE_LAYER = 'missingOutlineLayer'
export const NO_PATHS_IN_OUTLINE_LAYER = 'noPathsInOutlineLayer'
export const NO_CLOSED_REGIONS_FOUND = 'noClosedRegionsFound'

export interface BoardShape {
  size: SizeEnvelope
  regions: ImageRegion[]
  openPaths: ImagePath[]
  failureReason?: BoardShapeFailureReason
}

export interface BoardShapeRender {
  viewBox: ViewBox
  path?: SvgElement
  failureReason?: BoardShapeFailureReason
}

export type BoardShapeFailureReason =
  | typeof MISSING_OUTLINE_LAYER
  | typeof NO_PATHS_IN_OUTLINE_LAYER
  | typeof NO_CLOSED_REGIONS_FOUND

export function plotBoardShape(
  layers: Layer[],
  plotTreesById: Record<string, ImageTree>,
  maximumGap: number
): BoardShape {
  const outlineId = getOutlineLayer(layers)
  const outlinePlot = outlineId ? plotTreesById[outlineId] : undefined
  const size = BoundingBox.sum(
    Object.values(plotTreesById).map(({size}) => size)
  )

  if (outlinePlot === undefined) {
    return {
      size,
      regions: [],
      openPaths: [],
      failureReason: MISSING_OUTLINE_LAYER,
    }
  }

  const inputSegments = outlinePlot.children
    .filter((node): node is ImagePath => node.type === IMAGE_PATH)
    .flatMap(path => path.segments)

  if (inputSegments.length === 0) {
    return {
      size,
      regions: [],
      openPaths: [],
      failureReason: NO_PATHS_IN_OUTLINE_LAYER,
    }
  }

  const allPaths = walkPaths(inputSegments)
  const [regions, openPaths] = fillGaps(allPaths, maximumGap)

  if (regions.length === 0) {
    return {size, regions, openPaths, failureReason: NO_CLOSED_REGIONS_FOUND}
  }

  return {
    regions,
    openPaths,
    size: BoundingBox.fromGraphics(regions),
  }
}

export function renderBoardShape(boardShape: BoardShape): BoardShapeRender {
  const {regions, size, failureReason} = boardShape
  const viewBox = sizeToViewBox(size)
  const segments = regions.flatMap(r => r.segments)

  return failureReason
    ? {viewBox, failureReason}
    : {viewBox, path: renderGraphic({type: IMAGE_REGION, segments})}
}
