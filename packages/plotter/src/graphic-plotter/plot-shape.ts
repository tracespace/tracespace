import * as Tree from '../tree'
import type {Location} from '../location-store'
import type {SimpleTool} from '../tool-store'

import {createShape, shapeToSegments} from './shapes'

export function plotShape(tool: SimpleTool, location: Location): Tree.Shape {
  const {shape: toolShape, hole: toolHole} = tool
  const shape = createShape(toolShape, location.endPoint)

  if (toolHole !== undefined) {
    const holeShape = createShape(toolHole, location.endPoint)

    return {
      type: Tree.LAYERED_SHAPE,
      shapes: [
        {
          type: Tree.OUTLINE,
          erase: false,
          segments: shapeToSegments(shape),
        },
        {
          type: Tree.OUTLINE,
          erase: true,
          segments: shapeToSegments(holeShape),
        },
      ],
    }
  }

  return shape
}
