import * as Tree from './tree'
// TODO: test
import {TWO_PI, limitAngle, rotateQuadrant} from './coordinate-math'
import type {SizeEnvelope as Box} from './tree'

export type {SizeEnvelope as Box} from './tree'

const _isEmpty = ([x1, y1, x2, y2]: Box): boolean => {
  return x1 === 0 && y1 === 0 && x2 === 0 && y2 === 0
}

export function empty(): Box {
  return [0, 0, 0, 0]
}

export function add(a: Box, b: Box): Box {
  if (_isEmpty(a)) return b
  if (_isEmpty(b)) return a

  return [
    Math.min(a[0], b[0]),
    Math.min(a[1], b[1]),
    Math.max(a[2], b[2]),
    Math.max(a[3], b[3]),
  ]
}

export function toViewBox(box: Box): Box {
  const [x1, y1, x2, y2] = box
  return [x1, y1, x2 - x1, y2 - y1]
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
  let result = empty()

  for (const segment of segments) {
    const rTool = width / 2
    const keyPoints = [segment.start, segment.end]

    if (segment.type === Tree.ARC) {
      const {start, end, center, radius} = segment
      const sweep = Math.abs(end[2] - start[2])

      // Normalize direction to counter-clockwise
      let [thetaStart, thetaEnd] =
        segment.direction === Tree.CCW ? [start[2], end[2]] : [end[2], start[2]]

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

    result = keyPoints
      .map<Box>(([x, y]) => [x - rTool, y - rTool, x + rTool, y + rTool])
      .reduce(add, result)
  }

  return result
}
