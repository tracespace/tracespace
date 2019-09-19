import {Box, Position} from '../types'
import {roundToPrecision} from '../utils'

export function empty(): Box {
  return [Infinity, Infinity, -Infinity, -Infinity]
}

export function add(a: Box, b: Box): Box {
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
): Box {
  return [x, y, x + xSize, y + ySize]
}

export function fromCircle(cx: number, cy: number, r: number): Box {
  return [cx - r, cy - r, cx + r, cy + r]
}

export function addPosition(box: Box, position: Position): Box {
  const [x, y] = position

  return [
    Math.min(box[0], x),
    Math.min(box[1], y),
    Math.max(box[2], x),
    Math.max(box[3], y),
  ]
}

export function toViewBox(box: Box): Box {
  if (box.some(v => v === Infinity || v === -Infinity)) return [0, 0, 0, 0]

  return [box[0], box[1], box[2] - box[0], box[3] - box[1]].map(
    roundToPrecision
  ) as Box
}
