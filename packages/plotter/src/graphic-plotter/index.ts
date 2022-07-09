// Graphic plotter
// Takes nodes and turns them into graphics to be added to the image
import {
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
  GerberNode,
  GraphicType,
  Filetype,
} from '@tracespace/parser'

import * as Tree from '../tree'
import {SIMPLE_TOOL, Tool} from '../tool-store'
import {Location} from '../location-store'

import {plotShape} from './plot-shape'
import {plotMacro} from './plot-macro'
import {CCW, CW, ArcDirection, plotSegment, plotPath} from './plot-path'

export interface GraphicPlotter {
  plot(
    node: GerberNode,
    tool: Tool | undefined,
    location: Location
  ): Tree.ImageGraphic[]
}

export function createGraphicPlotter(filetype: Filetype): GraphicPlotter {
  const plotter = Object.create(GraphicPlotterPrototype)

  return filetype === DRILL
    ? Object.assign(plotter, DrillGraphicPlotterTrait)
    : plotter
}

interface GraphicPlotterImpl extends GraphicPlotter {
  _currentPath: CurrentPath | undefined
  _arcDirection: ArcDirection | undefined
  _ambiguousArcCenter: boolean
  _regionMode: boolean
  _defaultGraphic: NonNullable<GraphicType> | undefined

  _setGraphicState(node: GerberNode): NonNullable<GraphicType> | undefined

  _plotCurrentPath(
    node: GerberNode,
    nextTool: Tool | undefined,
    nextGraphicType: NonNullable<GraphicType> | undefined
  ): Tree.ImageGraphic | undefined
}

interface CurrentPath {
  segments: Tree.PathSegment[]
  tool: Tool | undefined
  region: boolean
}

const GraphicPlotterPrototype: GraphicPlotterImpl = {
  _currentPath: undefined,
  _arcDirection: undefined,
  _ambiguousArcCenter: false,
  _regionMode: false,
  _defaultGraphic: undefined,

  plot(
    node: GerberNode,
    tool: Tool | undefined,
    location: Location
  ): Tree.ImageGraphic[] {
    const graphics: Tree.ImageGraphic[] = []
    const nextGraphicType = this._setGraphicState(node)
    const pathGraphic = this._plotCurrentPath(node, tool, nextGraphicType)

    if (pathGraphic) {
      graphics.push(pathGraphic)
    }

    if (nextGraphicType === SHAPE && tool) {
      const shape =
        tool.type === SIMPLE_TOOL
          ? plotShape(tool, location)
          : plotMacro(tool, location)

      graphics.push({type: Tree.IMAGE_SHAPE, shape})
    }

    if (nextGraphicType === SEGMENT) {
      this._currentPath = this._currentPath ?? {
        segments: [],
        region: this._regionMode,
        tool,
      }

      this._currentPath.segments.push(
        plotSegment(location, this._arcDirection, this._ambiguousArcCenter)
      )
    }

    if (nextGraphicType === SLOT) {
      const pathGraphic = plotPath([plotSegment(location)], tool)

      if (pathGraphic) {
        graphics.push(pathGraphic)
      }
    }

    return graphics
  },

  _setGraphicState(node: GerberNode): NonNullable<GraphicType> | undefined {
    if (node.type === INTERPOLATE_MODE) {
      if (node.mode === CCW_ARC) {
        this._arcDirection = CCW
      } else if (node.mode === CW_ARC) {
        this._arcDirection = CW
      } else {
        this._arcDirection = undefined
      }
    }

    if (node.type === QUADRANT_MODE) {
      this._ambiguousArcCenter = node.quadrant === SINGLE
    }

    if (node.type === REGION_MODE) {
      this._regionMode = node.region
    }

    if (node.type !== GRAPHIC) {
      return undefined
    }

    if (node.graphic === SEGMENT) {
      this._defaultGraphic = SEGMENT
    } else if (node.graphic !== null) {
      this._defaultGraphic = undefined
    }

    return node.graphic ?? this._defaultGraphic
  },

  _plotCurrentPath(
    node: GerberNode,
    nextTool: Tool | undefined,
    nextGraphicType: NonNullable<GraphicType> | undefined
  ): Tree.ImageGraphic | undefined {
    if (this._currentPath === undefined) {
      return undefined
    }

    if (
      nextTool !== this._currentPath.tool ||
      node.type === REGION_MODE ||
      node.type === DONE ||
      (nextGraphicType === MOVE && this._currentPath.region) ||
      (nextGraphicType === SHAPE && this._currentPath !== undefined)
    ) {
      const pathGraphic = plotPath(
        this._currentPath.segments,
        this._currentPath.tool,
        this._currentPath.region
      )

      this._currentPath = undefined
      return pathGraphic
    }
  },
}

const DrillGraphicPlotterTrait: Partial<GraphicPlotterImpl> = {
  _defaultGraphic: SHAPE,
  _ambiguousArcCenter: true,

  _setGraphicState(node: GerberNode): NonNullable<GraphicType> | undefined {
    if (node.type === INTERPOLATE_MODE) {
      switch (node.mode) {
        case CW_ARC:
        case CCW_ARC:
        case LINE: {
          this._defaultGraphic = SEGMENT

          if (node.mode === CCW_ARC) {
            this._arcDirection = CCW
          } else if (node.mode === CW_ARC) {
            this._arcDirection = CW
          } else {
            this._arcDirection = undefined
          }

          break
        }

        case MOVE: {
          this._defaultGraphic = MOVE
          this._arcDirection = undefined
          break
        }

        default: {
          this._defaultGraphic = SHAPE
          this._arcDirection = undefined
        }
      }
    }

    if (node.type !== GRAPHIC) {
      return undefined
    }

    return node.graphic ?? this._defaultGraphic
  },
}
