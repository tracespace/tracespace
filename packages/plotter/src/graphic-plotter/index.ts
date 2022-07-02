// Graphic plotter
// Takes nodes and turns them into graphics to be added to the image
import {Child, GRAPHIC, SHAPE, SEGMENT, DONE} from '@tracespace/parser'

import {Tool, SimpleTool} from '../tool-store'
import {Location} from '../location-store'
import {
  CIRCLE,
  IMAGE_PATH,
  IMAGE_SHAPE,
  LINE,
  ImageGraphic,
  PathSegment,
} from '../tree'

import {plotShape} from './plot-shape'

export interface GraphicPlotter {
  plot(
    node: Child,
    tool: Tool | undefined,
    location: Location
  ): ImageGraphic | undefined
}

export function createGraphicPlotter(): GraphicPlotter {
  return Object.create(GraphicPlotterPrototype)
}

interface GraphicPlotterState {
  _currentPathSegments: PathSegment[] | undefined
  _currentPathTool: Tool | undefined
}

const GraphicPlotterPrototype: GraphicPlotter & GraphicPlotterState = {
  _currentPathSegments: undefined,
  _currentPathTool: undefined,

  plot(
    node: Child,
    tool: Tool | undefined,
    location: Location
  ): ImageGraphic | undefined {
    if (node.type === GRAPHIC && node.graphic === SHAPE) {
      const shape = plotShape(tool as SimpleTool, location.endPoint)

      if (shape) {
        return {type: IMAGE_SHAPE, shape}
      }
    }

    if (node.type === GRAPHIC && node.graphic === SEGMENT) {
      this._currentPathTool = tool
      this._currentPathSegments = this._currentPathSegments ?? []

      this._currentPathSegments.push({
        type: LINE,
        start: [location.startPoint.x, location.startPoint.y],
        end: [location.endPoint.x, location.endPoint.y],
      })
    }

    if (tool !== this._currentPathTool || node.type === DONE) {
      const segments = this._currentPathSegments ?? []

      if (segments.length > 0 && this._currentPathTool?.shape.type === CIRCLE) {
        const width = this._currentPathTool?.shape?.diameter

        this._currentPathSegments = undefined
        this._currentPathTool = undefined

        return {type: IMAGE_PATH, width, segments}
      }
    }
  },
}
