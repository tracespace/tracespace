import {
  InterpolateModeType,
  QuadrantModeType,
  CW_ARC,
  SINGLE,
  MULTI,
} from '@tracespace/parser'

import {roundToPrecision} from '../utils'
import {Position, ArcPosition, Offsets} from '../types'
import {Direction, PathSegment, CW, CCW} from './nodes'
import {line, arc} from './geometry'

const TWO_PI = Math.PI * 2

export function makeArcSegment(
  start: Position,
  end: Position,
  offsets: Offsets,
  interpolateMode: InterpolateModeType,
  quadrantMode: QuadrantModeType
): PathSegment {
  // arc radius (distance from start and end points to candidates)
  const [sx, sy] = start
  const direction = interpolateMode === CW_ARC ? CW : CCW
  const {i, j, a} = {i: offsets.i || 0, j: offsets.j || 0, a: offsets.a}
  const radius = a !== null ? a : Math.sqrt(i ** 2 + j ** 2)

  // short circuit if start and end are the same point
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

      return arc(arcStart, arcEnd, center, radius, TWO_PI, direction)
    }

    return line(start, end)
  }

  // get candidates for arc center based on arc radius
  let candidates = findCenterCandidates(start, end, radius)

  // if we have more than one candidate and offsets, sort the candidates by how
  // closely they compare to locations specified by the offsets
  if (candidates.length === 2 && a === null) {
    let offsetLocations: Position[] = [[sx + i, sy + j]]

    const getMinOffsetDistance = (c: Position): number => {
      return offsetLocations.reduce<number>(
        (r, ol) => Math.min(r, (ol[0] - c[0]) ** 2 + (ol[1] - c[1]) ** 2),
        Infinity
      )
    }

    // if we're in multi-quadrant mode, i and j will be signed, but in single
    // quadrant mode we got multiple sign combinations to check
    if (quadrantMode === SINGLE) {
      offsetLocations = [
        ...offsetLocations,
        [sx + i, sy - j],
        [sx - i, sy + j],
        [sx - i, sy - j],
      ]
    }

    // sort candidates by proximity to a valid center according to offsets
    candidates =
      getMinOffsetDistance(candidates[0]) <= getMinOffsetDistance(candidates[1])
        ? candidates
        : [candidates[1], candidates[0]]
  }

  // in multi-quadrant, rely on the accuracy of i and j
  // otherwise, pick the center with the smallest sweep to satisfy the single or
  // double quadrant case
  const [arcStart, arcEnd, center, sweep] =
    candidates.length === 1 || quadrantMode === MULTI
      ? getCenterAngles(start, end, candidates[0], direction)
      : candidates
          // calculate sweeps and pull out the candidate with the smallest
          .map(c => getCenterAngles(start, end, c, direction))
          .reduce((res, cand) => (cand[3] < res[3] ? cand : res))

  return arc(arcStart, arcEnd, center, radius, sweep, direction)
}

// find arc center candidates by calculating the arc radius and finding
// intersection points between the circles with that radius centered at the
// start and end points of the arc
// https://math.stackexchange.com/a/1367732
export function findCenterCandidates(
  start: Position,
  end: Position,
  radius: number
): [Position] | [Position, Position] {
  // this function assumes that start and end are different points
  const [x1, y1] = start
  const [x2, y2] = end

  // distance between the start and end points
  const [dx, dy] = [x2 - x1, y2 - y1]
  const [sx, sy] = [x2 + x1, y2 + y1]
  const distance = Math.sqrt(dx ** 2 + dy ** 2)

  // if the distance to the midpoint equals the arc radius, then there is
  // exactly one intersection at the midpoint; if the distance to the midpoint
  // is greater than the radius, assume we've got a rounding error and just use
  // the midpoint
  if (radius <= distance / 2) return [[x1 + dx / 2, y1 + dy / 2]]

  // no good name for these variables, but it's how the math works out
  const factor = Math.sqrt((4 * radius ** 2) / distance ** 2 - 1)
  const [xBase, yBase] = [sx / 2, sy / 2]
  const [xAddend, yAddend] = [(dy * factor) / 2, (dx * factor) / 2]

  return [
    [xBase + xAddend, yBase - yAddend],
    [xBase - xAddend, yBase + yAddend],
  ]
}

export function getCenterAngles(
  start: Position,
  end: Position,
  center: Position,
  direction: Direction
): [ArcPosition, ArcPosition, Position, number] {
  let thetaStart = Math.atan2(start[1] - center[1], start[0] - center[0])
  let thetaEnd = Math.atan2(end[1] - center[1], end[0] - center[0])

  // if cw, ensure the start angle is greater than the end angle
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
