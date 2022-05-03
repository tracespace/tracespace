// Geometry object creators
import * as Tree from '../tree'
import {HALF_PI, PI, THREE_HALF_PI, TWO_PI, roundToPrecision} from './math'

export const circle = (
  payload: Omit<Tree.CircleShape, 'type'>
): Tree.CircleShape => ({type: Tree.CIRCLE, ...payload})

export const rectangle = (
  payload: Omit<Tree.RectangleShape, 'type'>
): Tree.RectangleShape => ({type: Tree.RECTANGLE, ...payload})

export const polygon = (
  payload: Omit<Tree.PolygonShape, 'type'>
): Tree.PolygonShape => ({type: Tree.POLYGON, ...payload})

export const outline = (
  payload: Omit<Tree.OutlineShape, 'type'>
): Tree.OutlineShape => ({type: Tree.OUTLINE, ...payload})

export const clearOutline = (
  payload: Omit<Tree.ClearOutlineShape, 'type'>
): Tree.ClearOutlineShape => ({type: Tree.CLEAR_OUTLINE, ...payload})

export const layeredShape = (
  payload: Omit<Tree.LayeredShape, 'type'>
): Tree.LayeredShape => ({type: Tree.LAYERED_SHAPE, ...payload})

export const line = (
  payload: Omit<Tree.PathLineSegment, 'type'>
): Tree.PathLineSegment => ({type: Tree.LINE, ...payload})

export const arc = (
  payload: Omit<Tree.PathArcSegment, 'type' | 'direction'> &
    Partial<Pick<Tree.PathArcSegment, 'direction'>>
): Tree.PathArcSegment => ({
  ...payload,
  type: Tree.ARC,
  direction: payload.direction ?? Tree.CCW,
})

export const shapeToSegments = (
  shape: Tree.SimpleShape
): Tree.PathSegment[] => {
  if (shape.type === Tree.CIRCLE) {
    const {cx, cy, r} = shape
    return [
      arc({
        start: [roundToPrecision(cx + r), cy, 0],
        end: [roundToPrecision(cx + r), cy, 0],
        center: [cx, cy],
        radius: r,
        sweep: TWO_PI,
      }),
    ]
  }

  if (shape.type === Tree.RECTANGLE) {
    const {x, y, xSize, ySize, r} = shape

    return r === null
      ? [
          line({start: [x, y], end: [x + xSize, y]}),
          line({start: [x + xSize, y], end: [x + xSize, y + ySize]}),
          line({start: [x + xSize, y + ySize], end: [x, y + ySize]}),
          line({start: [x, y + ySize], end: [x, y]}),
        ]
      : [
          line({start: [x + r, y], end: [x + xSize - r, y]}),
          arc({
            start: [x + xSize - r, y, THREE_HALF_PI],
            end: [x + xSize, y + r, 0],
            center: [x + xSize - r, y + r],
            radius: r,
            sweep: HALF_PI,
          }),
          line({start: [x + xSize, y + r], end: [x + xSize, y + ySize - r]}),
          arc({
            start: [x + xSize, y + ySize - r, 0],
            end: [x + xSize - r, y + ySize, HALF_PI],
            center: [x + xSize - r, y + ySize - r],
            radius: r,
            sweep: HALF_PI,
          }),
          line({start: [x + xSize - r, y + ySize], end: [x + r, y + ySize]}),
          arc({
            start: [x + r, y + ySize, HALF_PI],
            end: [x, y + ySize - r, PI],
            center: [x + r, y + ySize - r],
            radius: r,
            sweep: HALF_PI,
          }),
          line({start: [x, y + ySize - r], end: [x, y + r]}),
          arc({
            start: [x, y + r, PI],
            end: [x + r, y, THREE_HALF_PI],
            center: [x + r, y + r],
            radius: r,
            sweep: HALF_PI,
          }),
        ]
  }

  if (shape.type === Tree.POLYGON) {
    return shape.points.flatMap((end, i) => {
      const start = shape.points[i - 1]
      return start ? [line({start, end})] : []
    })
  }

  return shape.segments
}
