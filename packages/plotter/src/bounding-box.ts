import * as Tree from './tree'

import {
  TWO_PI,
  limitAngle,
  rotateQuadrant,
  roundToPrecision,
} from './coordinate-math'

const _isEmpty = ([x1, y1, x2, y2]: Tree.Box): boolean => {
  return x1 === 0 && y1 === 0 && x2 === 0 && y2 === 0
}

export function empty(): Tree.Box {
  return [0, 0, 0, 0]
}

export function add(a: Tree.Box, b: Tree.Box): Tree.Box {
  if (_isEmpty(a)) return b
  if (_isEmpty(b)) return a

  return [
    Math.min(a[0], b[0]),
    Math.min(a[1], b[1]),
    Math.max(a[2], b[2]),
    Math.max(a[3], b[3]),
  ]
}

export function fromRectangle(
  x: number,
  y: number,
  xSize: number,
  ySize: number
): Tree.Box {
  return [x, y, x + xSize, y + ySize]
}

export function fromCircle(cx: number, cy: number, r: number): Tree.Box {
  return [cx - r, cy - r, cx + r, cy + r]
}

export function addPosition(box: Tree.Box, position: Tree.Position): Tree.Box {
  const [x, y] = position
  return add(box, [x, y, x, y])
}

export function toViewBox(box: Tree.Box): Tree.Box {
  if (
    box.some(
      v => v === Number.POSITIVE_INFINITY || v === Number.NEGATIVE_INFINITY
    )
  )
    return [0, 0, 0, 0]

  return [box[0], box[1], box[2] - box[0], box[3] - box[1]].map(
    roundToPrecision
  ) as Tree.Box
}

export function fromGraphic(graphic: Tree.ImageGraphic): Tree.Box {
  console.log('HEY BOX FROM GRAPHIC', graphic)
  return graphic.type === Tree.IMAGE_SHAPE
    ? fromShape(graphic.shape)
    : fromPath(
        graphic.segments,
        graphic.type === Tree.IMAGE_PATH ? graphic.width : undefined
      )
}

function fromPath(segments: Tree.PathSegment[], width = 0): Tree.Box {
  let box = empty()

  for (const segment of segments) {
    const rTool = width / 2
    const keyPoints = [segment.start, segment.end]

    if (segment.type === Tree.ARC) {
      const {start, end, center, sweep, radius} = segment
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
        if (thetaStart > thetaEnd || sweep === TWO_PI) keyPoints.push(p)
        // Rotate to check for next axis key point
        thetaStart = rotateQuadrant(thetaStart)
        thetaEnd = rotateQuadrant(thetaEnd)
      }
    }

    const pointsWithRadius = keyPoints.map(p => fromCircle(p[0], p[1], rTool))

    for (const b of pointsWithRadius) {
      box = add(box, b)
    }
  }

  return box
}

export function fromShape(shape: Tree.Shape): Tree.Box {
  switch (shape.type) {
    case Tree.CIRCLE: {
      return fromCircle(shape.cx, shape.cy, shape.r)
    }

    case Tree.RECTANGLE: {
      return fromRectangle(shape.x, shape.y, shape.xSize, shape.ySize)
    }

    case Tree.POLYGON: {
      let box = empty()
      for (const point of shape.points) {
        box = addPosition(box, point)
      }

      return box
    }

    case Tree.OUTLINE:
    case Tree.CLEAR_OUTLINE: {
      return fromPath(shape.segments)
    }

    case Tree.LAYERED_SHAPE: {
      let box = empty()
      for (const s of shape.shapes) {
        box = add(box, fromShape(s))
      }

      return box
    }

    default:
  }

  return empty()
}
