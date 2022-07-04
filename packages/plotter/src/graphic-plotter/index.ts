// Graphic plotter
// Takes nodes and turns them into graphics to be added to the image
import {
  Child,
  GRAPHIC,
  SHAPE,
  SEGMENT,
  MOVE,
  SLOT,
  DONE,
  LINE,
  CCW_ARC,
  CW_ARC,
  DRILL,
  SINGLE,
  INTERPOLATE_MODE,
  QUADRANT_MODE,
  REGION_MODE,
  GraphicType,
  InterpolateModeType,
  QuadrantModeType,
} from '@tracespace/parser'

import * as Tree from '../tree'
import {Tool, SimpleTool} from '../tool-store'
import {Location} from '../location-store'

import {plotShape} from './plot-shape'
import {CCW, CW, plotSegment, plotPath} from './plot-path'

export interface GraphicPlotter {
  plot(
    node: Child,
    tool: Tool | undefined,
    location: Location
  ): Tree.ImageGraphic[]
}

export function createGraphicPlotter(): GraphicPlotter {
  return Object.create(GraphicPlotterPrototype)
}

interface GraphicPlotterState {
  _currentPath: CurrentPathState | undefined
  _lastExplicitGraphicType: NonNullable<GraphicType> | undefined
  _interpolateMode: NonNullable<InterpolateModeType> | undefined
  _quadrantMode: NonNullable<QuadrantModeType> | undefined
  _regionMode: boolean
}

interface CurrentPathState {
  segments: Tree.PathSegment[]
  tool: Tool | undefined
  region: boolean
}

const GraphicPlotterPrototype: GraphicPlotter & GraphicPlotterState = {
  _currentPath: undefined,
  _lastExplicitGraphicType: undefined,
  _interpolateMode: undefined,
  _quadrantMode: undefined,
  _regionMode: false,

  plot(
    node: Child,
    tool: Tool | undefined,
    location: Location
  ): Tree.ImageGraphic[] {
    const graphics: Tree.ImageGraphic[] = []

    if (node.type === INTERPOLATE_MODE) {
      this._interpolateMode = node.mode ?? undefined
    }

    if (node.type === QUADRANT_MODE) {
      this._quadrantMode = node.quadrant ?? undefined
    }

    if (node.type === REGION_MODE) {
      this._regionMode = node.region
    }

    const nextGraphicType = getNextGraphicType(
      node,
      this._interpolateMode,
      this._lastExplicitGraphicType
    )

    const currentPath = this._currentPath ?? {
      segments: [],
      region: this._regionMode,
      tool,
    }

    if (shouldFinishPath(node, currentPath, tool, nextGraphicType)) {
      const pathGraphic = plotPath(
        currentPath.segments,
        currentPath.tool,
        currentPath.region
      )

      if (pathGraphic) {
        graphics.push(pathGraphic)
      }

      this._currentPath = undefined
    }

    if (nextGraphicType === SHAPE) {
      const shape = plotShape(tool as SimpleTool, location)

      if (shape) {
        graphics.push({type: Tree.IMAGE_SHAPE, shape})
      }
    }

    if (nextGraphicType === SEGMENT) {
      const ambiguousArcCenter = this._quadrantMode === SINGLE
      const arcDirection =
        this._interpolateMode === CCW_ARC
          ? CCW
          : this._interpolateMode === CW_ARC
          ? CW
          : undefined

      const segment = plotSegment(location, arcDirection, ambiguousArcCenter)

      currentPath.segments.push(segment)
      this._currentPath = currentPath
    }

    if (nextGraphicType === SLOT) {
      const pathGraphic = plotPath([plotSegment(location)], tool)

      if (pathGraphic) {
        graphics.push(pathGraphic)
      }
    }

    if (node.type === GRAPHIC && node.graphic !== SLOT) {
      this._lastExplicitGraphicType = node.graphic ?? undefined
    }

    return graphics
  },
}

function getNextGraphicType(
  node: Child,
  interpolateMode: InterpolateModeType | undefined,
  lastExplicitGraphicType: GraphicType | undefined
): NonNullable<GraphicType> | undefined {
  if (node.type !== GRAPHIC) {
    return undefined
  }

  if (node.graphic) {
    return node.graphic
  }

  if (lastExplicitGraphicType) {
    return lastExplicitGraphicType
  }

  if (interpolateMode === undefined || interpolateMode === DRILL) {
    return SHAPE
  }

  if (
    interpolateMode === LINE ||
    interpolateMode === CCW_ARC ||
    interpolateMode === CW_ARC
  ) {
    return SEGMENT
  }

  return MOVE
}

function shouldFinishPath(
  node: Child,
  currentPath: CurrentPathState,
  nextTool: Tool | undefined,
  nextGraphicType: NonNullable<GraphicType> | undefined
): boolean {
  return (
    nextTool !== currentPath.tool ||
    node.type === REGION_MODE ||
    node.type === DONE ||
    (node.type === INTERPOLATE_MODE && node.mode === MOVE) ||
    (nextGraphicType === MOVE && currentPath.region) ||
    (nextGraphicType === SHAPE && currentPath !== undefined)
  )
}
