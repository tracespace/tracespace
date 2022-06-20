import {
  InterpolateModeType,
  QuadrantModeType,
  CW_ARC,
  SINGLE,
  MULTI,
} from '@tracespace/parser'

import {Position, ArcPosition, Offsets} from '../tree'
import {Direction, PathSegment, CW, CCW} from '../tree'
import {line, arc} from './geometry'
import {roundToPrecision} from './math'

const TWO_PI = Math.PI * 2

export interface ArcSegmentOptions {
  start: Position
  end: Position
  offsets: Offsets
  interpolateMode: InterpolateModeType
  quadrantMode: QuadrantModeType
}

export function makeArcSegment({
  start,
  end,
  offsets,
  interpolateMode,
  quadrantMode,
}: ArcSegmentOptions): PathSegment {
  // Arc radius (distance from start and end points to candidates)
  const [sx, sy] = start
  const direction = interpolateMode === CW_ARC ? CW : CCW
  const {i, j, a} = {i: offsets.i ?? 0, j: offsets.j ?? 0, a: offsets.a}
  const radius = a === null ? Math.sqrt(i ** 2 + j ** 2) : a

  // Short circuit if start and end are the same point
  // multi-quadrant: full circle
  // else: dot (same as zero-length line segment)
  if (start[0] === end[0] && start[1] === end[1]) {
    if (quadrantMode === MULTI) {
      const [arcStart, arcEnd, center] = getCenterAngles(
        start,
        end,
        [sx + i, sy + j],
        direction
      )

      return arc({
        start: arcStart,
        end: arcEnd,
        center,
        radius,
        direction,
        sweep: TWO_PI,
      })
    }

    return line({start, end})
  }

  // Get candidates for arc center based on arc radius
  let candidates = findCenterCandidates(start, end, radius)

  // If we have more than one candidate and offsets, sort the candidates by how
  // closely they compare to locations specified by the offsets
  if (candidates.length === 2 && a === null) {
    let offsetLocations: Position[] = [[sx + i, sy + j]]

    const getMinOffsetDistance = (center: Position): number => {
      let result = Number.POSITIVE_INFINITY

      for (const location of offsetLocations) {
        const [x1, y1] = location
        const [x2, y2] = center
        result = Math.min(result, (x1 - x2) ** 2 + (y1 - y2) ** 2)
      }

      return result
    }

    // If we're in multi-quadrant mode, i and j will be signed, but in single
    // quadrant mode we got multiple sign combinations to check
    if (quadrantMode === SINGLE) {
      offsetLocations = [
        ...offsetLocations,
        [sx + i, sy - j],
        [sx - i, sy + j],
        [sx - i, sy - j],
      ]
    }

    // Sort candidates by proximity to a valid center according to offsets
    candidates =
      getMinOffsetDistance(candidates[0]) <= getMinOffsetDistance(candidates[1])
        ? candidates
        : [candidates[1], candidates[0]]
  }

  // In multi-quadrant, rely on the accuracy of i and j
  // otherwise, pick the center with the smallest sweep to satisfy the single or
  // double quadrant case
  let selectedArc

  if (candidates.length === 1 || quadrantMode === MULTI) {
    selectedArc = getCenterAngles(start, end, candidates[0], direction)
  } else {
    const arcs = candidates.map(c => getCenterAngles(start, end, c, direction))
    selectedArc = arcs[0]

    for (const arc of arcs.slice(1)) {
      if (arc[3] < selectedArc[3]) {
        selectedArc = arc
      }
    }
  }

  const [arcStart, arcEnd, center, sweep] = selectedArc
  return arc({start: arcStart, end: arcEnd, center, radius, sweep, direction})
}

// Find arc center candidates by calculating the arc radius and finding
// intersection points between the circles with that radius centered at the
// start and end points of the arc
// https://math.stackexchange.com/a/1367732
export function findCenterCandidates(
  start: Position,
  end: Position,
  radius: number
): [Position] | [Position, Position] {
  // This function assumes that start and end are different points
  const [x1, y1] = start
  const [x2, y2] = end

  // Distance between the start and end points
  const [dx, dy] = [x2 - x1, y2 - y1]
  const [sx, sy] = [x2 + x1, y2 + y1]
  const distance = Math.sqrt(dx ** 2 + dy ** 2)

  // If the distance to the midpoint equals the arc radius, then there is
  // exactly one intersection at the midpoint; if the distance to the midpoint
  // is greater than the radius, assume we've got a rounding error and just use
  // the midpoint
  if (radius <= distance / 2) {
    return [[roundToPrecision(x1 + dx / 2), roundToPrecision(y1 + dy / 2)]]
  }

  // No good name for these variables, but it's how the math works out
  const factor = Math.sqrt((4 * radius ** 2) / distance ** 2 - 1)
  const [xBase, yBase] = [sx / 2, sy / 2]
  const [xAddend, yAddend] = [(dy * factor) / 2, (dx * factor) / 2]

  return [
    [roundToPrecision(xBase + xAddend), roundToPrecision(yBase - yAddend)],
    [roundToPrecision(xBase - xAddend), roundToPrecision(yBase + yAddend)],
  ]
}

export function getCenterAngles(
  start: Position,
  end: Position,
  center: Position,
  direction: Direction
): [start: ArcPosition, end: ArcPosition, center: Position, sweep: number] {
  let thetaStart = Math.atan2(start[1] - center[1], start[0] - center[0])
  let thetaEnd = Math.atan2(end[1] - center[1], end[0] - center[0])

  // If cw, ensure the start angle is greater than the end angle
  // if cww, start should be less than end
  if (direction === CW) {
    thetaStart = thetaStart >= thetaEnd ? thetaStart : thetaStart + TWO_PI
  } else {
    thetaEnd = thetaEnd >= thetaStart ? thetaEnd : thetaEnd + TWO_PI
  }

  const sweep = Math.abs(thetaStart - thetaEnd)

  return [
    [start[0], start[1], roundToPrecision(thetaStart)],
    [end[0], end[1], roundToPrecision(thetaEnd)],
    center,
    roundToPrecision(sweep),
  ]
}
