import * as Parser from '@tracespace/parser'

import {PlotOptions} from '../options'
import {Position} from '../types'

import {
  ImageTree,
  ImageLayer,
  ImagePath,
  ImageRegion,
  IMAGE,
  IMAGE_LAYER,
  IMAGE_SHAPE,
} from '../tree'

import * as BBox from './bounding-box'
import {parseCoordinate} from './coordinates'
import {pathFinished, addSegmentToPath, getPathBox} from './plot-path'
import {plotShape, getShapeBox} from './plot-shape'
import {plotMacro} from './plot-macro'

const last = <E>(coll: E[]): E | null => coll[coll.length - 1] || null

export function createPlot(
  tree: Parser.GerberTree,
  options: PlotOptions
): ImageTree {
  const tools = tree.children.filter(
    (n): n is Parser.ToolDefinition => n.type === Parser.TOOL_DEFINITION
  )
  const macros = tree.children.filter(
    (n): n is Parser.ToolMacro => n.type === Parser.TOOL_MACRO
  )
  const toolMap = Object.fromEntries(tools.map(node => [node.code, node]))
  const macroMap = Object.fromEntries(macros.map(node => [node.name, node]))
  const getTool = (code: string): Parser.ToolDefinition | null => {
    return toolMap[code] || null
  }

  let position: Position = [0, 0]
  let tool: Parser.ToolDefinition | null = last(tools) ?? null
  let lastGraphicSet: Parser.GraphicType = null

  let regionMode = false
  let interpolateMode: Parser.InterpolateModeType =
    tree.filetype === Parser.GERBER ? Parser.LINE : null

  // Arcs in drill files are always 180 degrees max
  let quadrantMode: Parser.QuadrantModeType = null

  const currentLayer: ImageLayer = {
    type: IMAGE_LAYER,
    size: BBox.empty(),
    children: [],
  }

  let currentPath: ImagePath | ImageRegion | null = null

  for (const node of tree.children) {
    visitNode(node)
  }

  addCurrentPathToLayer()

  return {
    type: IMAGE,
    children: [currentLayer],
  }

  function addCurrentPathToLayer(): void {
    if (currentPath) {
      const pathSize = getPathBox(currentPath)
      currentLayer.size = BBox.add(currentLayer.size, pathSize)
      currentLayer.children.push(currentPath)
      currentPath = null
    }
  }

  function visitNode(node: Parser.ChildNode): void {
    switch (node.type) {
      case Parser.TOOL_CHANGE: {
        tool = getTool(node.code)
        break
      }

      case Parser.INTERPOLATE_MODE: {
        interpolateMode = node.mode
        break
      }

      case Parser.QUADRANT_MODE: {
        quadrantMode = node.quadrant
        break
      }

      case Parser.REGION_MODE: {
        regionMode = node.region
        break
      }

      case Parser.GRAPHIC: {
        visitGraphicNode(node)
        break
      }

      default:
    }
  }

  function visitGraphicNode(node: Parser.Graphic): void {
    const {graphic, coordinates} = node
    const x = parseCoordinate(coordinates.x ?? null, options)
    const y = parseCoordinate(coordinates.y ?? null, options)
    let nextPosition: Position = [
      Number.isFinite(x) ? x : position[0],
      Number.isFinite(y) ? y : position[1],
    ]
    let nextGraphic = graphic ?? lastGraphicSet

    // All drill files will have graphic set to null; check interpolate (route)
    // mode for routing or drilling
    if (graphic === null && tree.filetype === Parser.DRILL) {
      if (interpolateMode === null) {
        nextGraphic = Parser.SHAPE
      } else if (interpolateMode === Parser.MOVE) {
        nextGraphic = Parser.MOVE
      } else {
        nextGraphic = Parser.SEGMENT
      }
    }

    if (tool && nextGraphic === Parser.SHAPE) {
      addShapeGraphic(tool, nextPosition)
    } else if (nextGraphic === Parser.SEGMENT) {
      addSegmentGraphic(coordinates, nextPosition)
    } else if (nextGraphic === Parser.SLOT) {
      nextPosition = addSlotGraphic(coordinates, nextPosition)
    }

    lastGraphicSet = nextGraphic
    position = nextPosition
  }

  function addShapeGraphic(
    tool: Parser.ToolDefinition,
    nextPosition: Position
  ): void {
    const shape =
      tool.shape.type === Parser.MACRO_SHAPE
        ? plotMacro(macroMap[tool.shape.name], tool.shape.params, nextPosition)
        : plotShape(tool.shape, tool.hole, nextPosition)

    const shapeSize = getShapeBox(shape)

    currentLayer.children.push({type: IMAGE_SHAPE, shape})
    currentLayer.size = BBox.add(currentLayer.size, shapeSize)
  }

  function addSegmentGraphic(
    coordinates: Parser.Coordinates,
    nextPosition: Position
  ): void {
    if (currentPath !== null && pathFinished(currentPath, tool, regionMode)) {
      addCurrentPathToLayer()
    }

    const offsets = {
      i: parseCoordinate(coordinates.i ?? null, options) || null,
      j: parseCoordinate(coordinates.j ?? null, options) || null,
      a: parseCoordinate(coordinates.a ?? null, options) || null,
    }

    currentPath = addSegmentToPath({
      path: currentPath,
      start: position,
      end: nextPosition,
      offsets,
      tool,
      interpolateMode,
      regionMode,
      quadrantMode,
    })
  }

  function addSlotGraphic(
    coordinates: Parser.Coordinates,
    nextPosition: Position
  ): Position {
    const x1 = parseCoordinate(coordinates.x1 ?? null, options)
    const y1 = parseCoordinate(coordinates.y1 ?? null, options)
    const x2 = parseCoordinate(coordinates.x2 ?? null, options)
    const y2 = parseCoordinate(coordinates.y2 ?? null, options)
    const startPosition: Position = [
      Number.isFinite(x1) ? x1 : position[0],
      Number.isFinite(y1) ? y1 : position[1],
    ]
    nextPosition = [
      Number.isFinite(x2) ? x2 : startPosition[0],
      Number.isFinite(y2) ? y2 : startPosition[1],
    ]

    addCurrentPathToLayer()
    currentPath = addSegmentToPath({
      path: null,
      start: startPosition,
      end: nextPosition,
      offsets: {i: null, j: null, a: null},
      tool,
      interpolateMode: Parser.LINE,
      regionMode: false,
      quadrantMode: null,
    })
    addCurrentPathToLayer()

    return nextPosition
  }
}
