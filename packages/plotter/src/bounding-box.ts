import * as Tree from './tree'
import {TWO_PI, limitAngle, rotateQuadrant} from './coordinate-math'
import type {SizeEnvelope as Box} from './tree'

export type {SizeEnvelope as Box} from './tree'

export type ViewBox = [xMin: number, yMin: number, xSize: number, ySize: number]

export function isEmpty(box: Box): box is [] {
  return box.length === 0
}

export function empty(): Box {
  return []
}

export function add(a: Box, b: Box): Box {
  if (isEmpty(a)) return b
  if (isEmpty(b)) return a

  return [
    Math.min(a[0], b[0]),
    Math.min(a[1], b[1]),
    Math.max(a[2], b[2]),
    Math.max(a[3], b[3]),
  ]
}

export function toViewBox(box: Box): ViewBox {
  return isEmpty(box)
    ? [0, 0, 0, 0]
    : [box[0], box[1], box[2] - box[0], box[3] - box[1]]
}

export function fromGraphic(graphic: Tree.ImageGraphic): Box {
  return graphic.type === Tree.IMAGE_SHAPE
    ? fromShape(graphic.shape)
    : fromPath(
        graphic.segments,
        graphic.type === Tree.IMAGE_PATH ? graphic.width : undefined
      )
}

export function fromShape(shape: Tree.Shape): Box {
  switch (shape.type) {
    case Tree.CIRCLE: {
      const {cx, cy, r} = shape
      return [cx - r, cy - r, cx + r, cy + r]
    }

    case Tree.RECTANGLE: {
      const {x, y, xSize, ySize} = shape
      return [x, y, x + xSize, y + ySize]
    }

    case Tree.POLYGON: {
      return shape.points
        .map<Box>(([x, y]) => [x, y, x, y])
        .reduce(add, empty())
    }

    case Tree.OUTLINE: {
      return fromPath(shape.segments)
    }

    case Tree.LAYERED_SHAPE: {
      return shape.shapes
        .filter(({erase}) => !erase)
        .map(fromShape)
        .reduce(add, empty())
    }
  }
}

function fromPath(segments: Tree.PathSegment[], width = 0): Box {
  const rTool = width / 2
  const keyPoints: Array<Tree.Position | Tree.ArcPosition> = []

  for (const segment of segments) {
    keyPoints.push(segment.start, segment.end)

    if (segment.type === Tree.ARC) {
      const {start, end, center, radius} = segment
      const sweep = Math.abs(end[2] - start[2])

      // Normalize direction to counter-clockwise
      let [thetaStart, thetaEnd] =
        end[2] > start[2] ? [start[2], end[2]] : [end[2], start[2]]

      thetaStart = limitAngle(thetaStart)
      thetaEnd = limitAngle(thetaEnd)

      const axisPoints: Tree.Position[] = [
        [center[0] + radius, center[1]],
        [center[0], center[1] + radius],
        [center[0] - radius, center[1]],
        [center[0], center[1] - radius],
      ]

      for (const p of axisPoints) {
        if (thetaStart > thetaEnd || sweep === TWO_PI) {
          keyPoints.push(p)
        }

        // Rotate to check for next axis key point
        thetaStart = rotateQuadrant(thetaStart)
        thetaEnd = rotateQuadrant(thetaEnd)
      }
    }
  }

  return keyPoints
    .map<Box>(([x, y]) => [x - rTool, y - rTool, x + rTool, y + rTool])
    .reduce(add, empty())
}
