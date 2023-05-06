import * as Tree from '../tree'
import type {Tool} from '../tool-store'
import {SIMPLE_TOOL} from '../tool-store'
import type {Location, Point} from '../location-store'
import {TWO_PI} from '../coordinate-math'

import {plotRectPath} from './plot-rect-path'

export const CW = 'cw'
export const CCW = 'ccw'

export type ArcDirection = typeof CW | typeof CCW

export function plotSegment(
  location: Location,
  arcDirection?: ArcDirection,
  ambiguousArcCenter?: boolean
): Tree.PathSegment {
  return arcDirection === undefined
    ? createLineSegment(location)
    : createArcSegment(location, arcDirection, ambiguousArcCenter)
}

export function plotContour(
  segments: Tree.PathSegment[]
): Tree.ImageGraphicBase | undefined {
  if (segments.length > 0) {
    return {type: Tree.IMAGE_REGION, segments}
  }
}

export function plotLine(
  segment: Tree.PathSegment,
  tool: Tool | undefined
): Tree.ImageGraphicBase | undefined {
  if (tool?.type === SIMPLE_TOOL && tool.shape.type === Tree.CIRCLE) {
    // return {
    //   type: Tree.IMAGE_PATH,
    //   width: tool.shape.diameter,
    // }
    return plotContour(contourizeCirclePath(segment, tool.shape.diameter))
  }

  if (tool?.type === SIMPLE_TOOL && tool.shape.type === Tree.RECTANGLE) {
    return plotRectPath(segment, tool.shape)
  }
}

function createLineSegment(location: Location): Tree.PathLineSegment {
  return {
    type: Tree.LINE,
    start: [location.startPoint.x, location.startPoint.y],
    end: [location.endPoint.x, location.endPoint.y],
  }
}

function contourizeCirclePath(
  segment: Tree.PathSegment,
  width: number
): Tree.PathSegment[] {
  const {start, end} = segment
  if (segment.type === Tree.LINE) {
    const [x1, y1] = start
    const [x2, y2] = end
    const theta = Math.atan2(y2 - y1, x2 - x1)
    const dx = -(width / 2) * Math.sin(theta)
    const dy = (width / 2) * Math.cos(theta)
    return [
      {
        type: Tree.LINE,
        start: [x1 + dx, y1 + dy],
        end: [x2 + dx, y2 + dy],
      },
      {
        type: Tree.ARC,
        start: [x2 + dx, y2 + dy, theta + Math.PI / 2],
        end: [x2 - dx, y2 - dy, theta - Math.PI / 2],
        center: [x2, y2],
        radius: width / 2,
      },
      {
        type: Tree.LINE,
        start: [x2 - dx, y2 - dy],
        end: [x1 - dx, y1 - dy],
      },
      {
        type: Tree.ARC,
        start: [x1 - dx, y1 - dy, theta + (Math.PI * 3) / 2],
        end: [x1 + dx, y1 + dy, theta + Math.PI / 2],
        center: [x1, y1],
        radius: width / 2,
      },
    ]
  } else {
    const {start, end, radius, center} = segment
    const [x1, y1] = start
    const [x2, y2] = end
    const [cx, cy] = center
    const theta1 = start[2]
    const theta2 = end[2]
    const dx = -(width / 2) * Math.sin(theta1 - Math.PI / 2)
    const dy = (width / 2) * Math.cos(theta1 - Math.PI / 2)
    const dx2 = -(width / 2) * Math.sin(theta2 - Math.PI / 2)
    const dy2 = (width / 2) * Math.cos(theta2 - Math.PI / 2)
    if (theta1 > theta2) {
      return [
        {
          type: Tree.ARC,
          start: [x1 + dx, y1 + dy, theta1],
          end: [x2 + dx2, y2 + dy2, theta2],
          center: [cx, cy],
          radius: radius + width / 2,
        },
        {
          type: Tree.ARC,
          start: [x2 + dx2, y2 + dy2, theta2],
          end: [x2 - dx2, y2 - dy2, theta2 - Math.PI],
          center: [x2, y2],
          radius: width / 2,
        },
        {
          type: Tree.ARC,
          start: [x2 - dx2, y2 - dy2, theta2],
          end: [x1 - dx, y1 - dy, theta1],
          center: [cx, cy],
          radius: radius - width / 2,
        },
        {
          type: Tree.ARC,
          start: [x1 - dx, y1 - dy, theta1 + Math.PI],
          end: [x1 + dx, y1 + dy, theta1],
          center: [x1, y1],
          radius: width / 2,
        },
      ]
    } else {
      return [
        {
          type: Tree.ARC,
          start: [x1 + dx, y1 + dy, theta1],
          end: [x2 + dx2, y2 + dy2, theta2],
          center: [cx, cy],
          radius: radius + width / 2,
        },
        {
          type: Tree.ARC,
          start: [x2 + dx2, y2 + dy2, theta2],
          end: [x2 - dx2, y2 - dy2, theta2 + Math.PI],
          center: [x2, y2],
          radius: width / 2,
        },
        {
          type: Tree.ARC,
          start: [x2 - dx2, y2 - dy2, theta2],
          end: [x1 - dx, y1 - dy, theta1],
          center: [cx, cy],
          radius: radius - width / 2,
        },
        {
          type: Tree.ARC,
          start: [x1 - dx, y1 - dy, theta1 - Math.PI],
          end: [x1 + dx, y1 + dy, theta1],
          center: [x1, y1],
          radius: width / 2,
        },
      ]
    }
  }
}

function createArcSegment(
  location: Location,
  arcDirection: ArcDirection,
  ambiguousArcCenter = false
): Tree.PathSegment {
  const {startPoint, endPoint, arcOffsets} = location
  const radius =
    arcOffsets.a > 0
      ? arcOffsets.a
      : (arcOffsets.i ** 2 + arcOffsets.j ** 2) ** 0.5

  if (ambiguousArcCenter || arcOffsets.a > 0) {
    if (startPoint.x === endPoint.x && startPoint.y === endPoint.y) {
      return createLineSegment(location)
    }

    // Get the center candidates and select the candidate with the smallest arc
    const [start, end, center] = findCenterCandidates(location, radius)
      .map(centerPoint => {
        return getArcPositions(startPoint, endPoint, centerPoint, arcDirection)
      })
      .sort(([startA, endA], [startB, endB]) => {
        const absSweepA = Math.abs(endA[2] - startA[2])
        const absSweepB = Math.abs(endB[2] - startB[2])
        return absSweepA - absSweepB
      })[0]

    return {type: Tree.ARC, start, end, center, radius}
  }

  const centerPoint = {
    x: startPoint.x + arcOffsets.i,
    y: startPoint.y + arcOffsets.j,
  }

  const [start, end, center] = getArcPositions(
    startPoint,
    endPoint,
    centerPoint,
    arcDirection
  )

  return {type: Tree.ARC, start, end, center, radius}
}

export function getArcPositions(
  startPoint: Point,
  endPoint: Point,
  centerPoint: Point,
  arcDirection: ArcDirection
): [start: Tree.ArcPosition, end: Tree.ArcPosition, center: Tree.Position] {
  let startAngle = Math.atan2(
    startPoint.y - centerPoint.y,
    startPoint.x - centerPoint.x
  )
  let endAngle = Math.atan2(
    endPoint.y - centerPoint.y,
    endPoint.x - centerPoint.x
  )

  // If counter-clockwise, end angle should be greater than start angle
  if (arcDirection === CCW) {
    endAngle = endAngle > startAngle ? endAngle : endAngle + TWO_PI
  } else {
    startAngle = startAngle > endAngle ? startAngle : startAngle + TWO_PI
  }

  return [
    [startPoint.x, startPoint.y, startAngle],
    [endPoint.x, endPoint.y, endAngle],
    [centerPoint.x, centerPoint.y],
  ]
}

// Find arc center candidates by finding the intersection points
// of two circles with `radius` centered on the start and end points
// https://math.stackexchange.com/a/1367732
function findCenterCandidates(location: Location, radius: number): Point[] {
  // This function assumes that start and end are different points
  const {x: x1, y: y1} = location.startPoint
  const {x: x2, y: y2} = location.endPoint

  // Distance between the start and end points
  const [dx, dy] = [x2 - x1, y2 - y1]
  const [sx, sy] = [x2 + x1, y2 + y1]
  const distance = Math.sqrt(dx ** 2 + dy ** 2)

  // If the distance to the midpoint equals the arc radius, then there is
  // exactly one intersection at the midpoint; if the distance to the midpoint
  // is greater than the radius, assume we've got a rounding error and just use
  // the midpoint
  if (radius <= distance / 2) {
    return [{x: x1 + dx / 2, y: y1 + dy / 2}]
  }

  // No good name for these variables, but it's how the math works out
  const factor = Math.sqrt((4 * radius ** 2) / distance ** 2 - 1)
  const [xBase, yBase] = [sx / 2, sy / 2]
  const [xAddend, yAddend] = [(dy * factor) / 2, (dx * factor) / 2]

  return [
    {x: xBase + xAddend, y: yBase - yAddend},
    {x: xBase - xAddend, y: yBase + yAddend},
  ]
}
