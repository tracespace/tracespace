// Graphic plotter
// Takes nodes and turns them into graphics to be added to the image
import {
  Child,
  GRAPHIC,
  SHAPE,
  SEGMENT,
  DONE,
  CCW_ARC,
  INTERPOLATE_MODE,
  InterpolateModeType,
} from '@tracespace/parser'

import * as Tree from '../tree'
import {Tool, SimpleTool} from '../tool-store'
import {Location} from '../location-store'

import {plotShape} from './plot-shape'
import {plotSegment} from './plot-path'

export interface GraphicPlotter {
  plot(
    node: Child,
    tool: Tool | undefined,
    location: Location
  ): Tree.ImageGraphic | undefined
}

export function createGraphicPlotter(): GraphicPlotter {
  return Object.create(GraphicPlotterPrototype)
}

interface GraphicPlotterState {
  _currentPathSegments: Tree.PathSegment[] | undefined
  _currentPathTool: Tool | undefined
  _interpolateMode: InterpolateModeType | undefined
}

const GraphicPlotterPrototype: GraphicPlotter & GraphicPlotterState = {
  _currentPathSegments: undefined,
  _currentPathTool: undefined,
  _interpolateMode: undefined,

  plot(
    node: Child,
    tool: Tool | undefined,
    location: Location
  ): Tree.ImageGraphic | undefined {
    if (node.type === INTERPOLATE_MODE) {
      this._interpolateMode = node.mode
    }

    if (node.type === GRAPHIC && node.graphic === SHAPE) {
      const shape = plotShape(tool as SimpleTool, location)

      if (shape) {
        return {type: Tree.IMAGE_SHAPE, shape}
      }
    }

    if (node.type === GRAPHIC && node.graphic === SEGMENT) {
      this._currentPathTool = tool
      this._currentPathSegments = this._currentPathSegments ?? []

      let arcDirection: Tree.ArcDirection | undefined
      if (this._interpolateMode === CCW_ARC) {
        arcDirection = Tree.CCW
      }

      const segment = plotSegment(location, arcDirection)
      this._currentPathSegments.push(segment)
    }

    if (tool !== this._currentPathTool || node.type === DONE) {
      const segments = this._currentPathSegments ?? []

      if (
        segments.length > 0 &&
        this._currentPathTool?.shape.type === Tree.CIRCLE
      ) {
        const width = this._currentPathTool?.shape?.diameter

        this._currentPathSegments = undefined
        this._currentPathTool = undefined

        return {type: Tree.IMAGE_PATH, width, segments}
      }
    }
  },
}
