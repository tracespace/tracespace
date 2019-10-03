import visit from 'unist-util-visit-parents'
import * as Parser from '@tracespace/parser'
import {
  LayerType,
  LayerFormat,
  GerberTree,
  ToolMap,
  MacroMap,
  Position,
} from '../types'
import * as BBox from './bounding-box'
import {parseCoordinate} from './coordinates'
import {pathFinished, addSegmentToPath, getPathBox} from './plot-path'
import {plotShape, getShapeBox} from './plot-shape'
import {plotMacro} from './plot-macro'

import {
  ImageTree,
  ImageLayer,
  ImagePath,
  ImageRegion,
  IMAGE,
  IMAGE_LAYER,
  IMAGE_SHAPE,
} from './nodes'

const last = <E>(coll: E[]): E | null => coll[coll.length - 1] || null

export function createPlot(
  type: LayerType,
  format: LayerFormat,
  tree: GerberTree
): ImageTree {
  const [header, image] = tree.children
  const tools = header.children.filter(
    (n): n is Parser.ToolDefinition => n.type === Parser.TOOL_DEFINITION
  )
  const macros = header.children.filter(
    (n): n is Parser.ToolMacro => n.type === Parser.TOOL_MACRO
  )
  const toolMap = tools.reduce<ToolMap>(
    (result, node) => ({...result, [node.code]: node}),
    {}
  )
  const macroMap = macros.reduce<MacroMap>(
    (result, node) => ({...result, [node.name]: node}),
    {}
  )
  const getTool = (code: string): Parser.ToolDefinition | null => {
    return toolMap[code] || null
  }

  let position: Position = [0, 0]
  let tool: Parser.ToolDefinition | null = last(tools) || null
  let lastGraphicSet: Parser.GraphicType = null

  let regionMode = false
  let interpolateMode: Parser.InterpolateModeType =
    format.filetype === Parser.GERBER ? Parser.LINE : null

  // arcs in drill files are always 180 degrees max
  let quadrantMode: Parser.QuadrantModeType = null

  const currentLayer: ImageLayer = {
    type: IMAGE_LAYER,
    size: BBox.empty(),
    children: [],
  }

  let currentPath: ImagePath | ImageRegion | null = null

  visit(image, visitNode)
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

  function visitNode(node: Parser.ImageChild): unknown {
    switch (node.type) {
      case Parser.TOOL_CHANGE: {
        return (tool = getTool(node.code))
      }

      case Parser.INTERPOLATE_MODE: {
        return (interpolateMode = node.mode)
      }

      case Parser.QUADRANT_MODE: {
        return (quadrantMode = node.quadrant)
      }

      case Parser.REGION_MODE: {
        return (regionMode = node.region)
      }

      case Parser.GRAPHIC: {
        return visitGraphicNode(node)
      }
    }
  }

  function visitGraphicNode(node: Parser.Graphic): void {
    const {graphic, coordinates} = node
    const x = parseCoordinate(coordinates.x, format)
    const y = parseCoordinate(coordinates.y, format)
    let nextPosition: Position = [
      Number.isFinite(x) ? x : position[0],
      Number.isFinite(y) ? y : position[1],
    ]
    let nextGraphic = graphic || lastGraphicSet

    // all drill files will have graphic set to null; check interpolate (route)
    // mode for routing or drilling
    if (graphic === null && format.filetype === Parser.DRILL) {
      if (interpolateMode === null) {
        nextGraphic = Parser.SHAPE
      } else if (interpolateMode === Parser.MOVE) {
        nextGraphic = Parser.MOVE
      } else {
        nextGraphic = Parser.SEGMENT
      }
    }

    if (tool && nextGraphic === Parser.SHAPE) {
      const shape =
        tool.shape.type !== Parser.MACRO_SHAPE
          ? plotShape(tool.shape, tool.hole, nextPosition)
          : plotMacro(
              macroMap[tool.shape.name],
              tool.shape.params,
              nextPosition
            )

      const shapeSize = getShapeBox(shape)

      currentLayer.children.push({type: IMAGE_SHAPE, shape})
      currentLayer.size = BBox.add(currentLayer.size, shapeSize)
    } else if (nextGraphic === Parser.SEGMENT) {
      if (currentPath !== null && pathFinished(currentPath, tool, regionMode)) {
        addCurrentPathToLayer()
      }

      const offsets = {
        i: parseCoordinate(coordinates.i, format) || null,
        j: parseCoordinate(coordinates.j, format) || null,
        a: parseCoordinate(coordinates.a, format) || null,
      }

      currentPath = addSegmentToPath(
        currentPath,
        position,
        nextPosition,
        offsets,
        tool,
        interpolateMode,
        regionMode,
        quadrantMode
      )
    } else if (nextGraphic === Parser.SLOT) {
      const x1 = parseCoordinate(coordinates.x1, format)
      const y1 = parseCoordinate(coordinates.y1, format)
      const x2 = parseCoordinate(coordinates.x2, format)
      const y2 = parseCoordinate(coordinates.y2, format)
      const startPosition: Position = [
        Number.isFinite(x1) ? x1 : position[0],
        Number.isFinite(y1) ? y1 : position[1],
      ]
      nextPosition = [
        Number.isFinite(x2) ? x2 : startPosition[0],
        Number.isFinite(y2) ? y2 : startPosition[1],
      ]

      addCurrentPathToLayer()
      currentPath = addSegmentToPath(
        null,
        startPosition,
        nextPosition,
        {i: null, j: null, a: null},
        tool,
        Parser.LINE,
        false,
        null
      )
      addCurrentPathToLayer()
    }

    lastGraphicSet = nextGraphic
    position = nextPosition
  }
}
