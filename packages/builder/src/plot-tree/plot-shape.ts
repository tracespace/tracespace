import {
  ToolDefinition,
  ToolShape,
  CIRCLE,
  RECTANGLE,
  OBROUND,
  POLYGON,
} from '@tracespace/parser'
import {IMAGE_SHAPE, ImageShape, Position, BoundingBox} from './nodes'
import * as BBox from './bounding-box'

export function plotShape(
  tool: ToolDefinition,
  position: Position
): [ImageShape, BoundingBox] {
  const {shape} = tool
  const [x, y] = position
  const image: ImageShape = {
    type: IMAGE_SHAPE,
    x: position[0],
    y: position[1],
    shape: tool.shape,
  }

  let box: BoundingBox = BBox.empty()

  if (shape.type === CIRCLE) {
    const r = shape.diameter / 2
    box = BBox.fromSimpleShape(position, r, r)
  } else if (shape.type === RECTANGLE || shape.type === OBROUND) {
    const {xSize, ySize} = shape
    box = BBox.fromSimpleShape(position, xSize / 2, ySize / 2)
  } else if (shape.type === POLYGON) {
    const r = shape.diameter / 2
    const offset = ((shape.rotation || 0) * Math.PI) / 180
    const step = (2 * Math.PI) / shape.vertices
    let i

    for (i = 0; i < shape.vertices; i++) {
      const theta = step * i + offset
      const pointX = x + r * Math.cos(theta)
      const pointY = y + r * Math.sin(theta)
      box = BBox.addPosition(box, [pointX, pointY])
    }
  }

  return [image, box]
}
