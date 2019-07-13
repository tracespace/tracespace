import visit from 'unist-util-visit-parents'
import * as Parser from '@tracespace/parser'
import {LayerType, LayerFormat, GerberTree, ToolMap} from '../types'
import {
  ImageTree,
  ImageLayer,
  ImagePath,
  IMAGE,
  IMAGE_LAYER,
  IMAGE_SHAPE,
} from './nodes'
import * as BBox from './bounding-box'
import {parseCoordinate} from './coordinates'
import {addSegment} from './add-segment'
import {plotShape} from './plot-shape'

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
  const toolsMap = tools.reduce<ToolMap>(
    (result, node) => ({...result, [node.code]: node}),
    {}
  )

  let position: [number, number] = [0, 0]
  let tool: Parser.ToolDefinition | null
  let currentLayer: ImageLayer = {
    type: IMAGE_LAYER,
    size: BBox.empty(),
    children: [],
  }

  let currentPath: ImagePath | null = null

  visit(image, Parser.GRAPHIC, visitGraphicNode)

  return {
    type: IMAGE,
    children: [currentLayer],
  }

  function visitGraphicNode(
    graphicNode: Parser.Graphic,
    ancestors: Parser.Ancestor[]
  ): void {
    const {graphic, coordinates} = graphicNode
    const x = parseCoordinate(coordinates.x, format)
    const y = parseCoordinate(coordinates.y, format)
    const nextPosition: [number, number] = [
      Number.isFinite(x) ? x : position[0],
      Number.isFinite(y) ? y : position[1],
    ]

    if (graphic && graphic !== Parser.MOVE) {
      tool = getCurrentTool(ancestors) || tool

      if (tool) {
        if (graphic === Parser.SHAPE) {
          const [shape, shapeSize] = plotShape(tool, nextPosition)
          currentLayer.children.push(shape)
          currentLayer.size = BBox.add(currentLayer.size, shapeSize)
        } else {
          const nextPath = addSegment(
            currentPath,
            tool,
            position,
            nextPosition,
            false
          )

          if (currentPath !== nextPath) {
            if (currentPath) currentLayer.children.push(currentPath)
            currentPath = nextPath
          }
        }
      }
    }

    position = nextPosition
  }

  function getCurrentTool(
    ancestors: Parser.Ancestor[]
  ): Parser.ToolDefinition | null {
    const toolNode = ancestors.find(
      (a): a is Parser.Tool => a.type === Parser.TOOL
    )

    if (toolNode) return toolsMap[toolNode.code] || null
    return last(tools)
  }
}
