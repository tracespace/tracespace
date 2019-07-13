import {BoundingBox, Position} from './nodes'

export function empty(): BoundingBox {
  return [Infinity, Infinity, -Infinity, -Infinity]
}

export function add(a: BoundingBox, b: BoundingBox): BoundingBox {
  return [
    Math.min(a[0], b[0]),
    Math.min(a[1], b[1]),
    Math.max(a[2], b[2]),
    Math.max(a[3], b[3]),
  ]
}

export function fromSimpleShape(
  position: Position,
  rx: number,
  ry: number
): BoundingBox {
  const [x, y] = position
  return [x - rx, y - ry, x + rx, y + ry]
}

export function addPosition(box: BoundingBox, position: Position): BoundingBox {
  const [x, y] = position

  return [
    Math.min(box[0], x),
    Math.min(box[1], y),
    Math.max(box[2], x),
    Math.max(box[3], y),
  ]
}
