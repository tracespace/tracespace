import {MACRO_SHAPE} from '@tracespace/parser'

import * as Tree from '../tree'
import {Location} from '../location-store'
import {SimpleTool} from '../tool-store'

import {createShape, shapeToSegments} from './shapes'

export function plotShape(tool: SimpleTool, location: Location): Tree.Shape {
  const {shape: toolShape, hole: toolHole} = tool
  const shape = createShape(toolShape, location.endPoint)
  const holeShape = toolHole
    ? createShape(toolHole, location.endPoint)
    : undefined

  return holeShape === undefined
    ? shape
    : {
        type: Tree.OUTLINE,
        segments: [...shapeToSegments(shape), ...shapeToSegments(holeShape)],
      }
}
