// Functions for stroking rectangular tools
// Stroking rectangular tools is deprecated by the Gerber spec
// This functionality may be dropped and replaced with a warning
import type {Rectangle} from '@tracespace/parser'

import * as Tree from '../tree'
import {positionsEqual, HALF_PI, PI} from '../coordinate-math'

// Rectangular tools make interesting stroke geometry; see the Gerber spec
// for graphics and examples
export function plotRectPath(
  segments: Tree.PathSegment[],
  shape: Rectangle
): Tree.ImageShape {
  const shapes = segments
    .filter((s): s is Tree.PathLineSegment => s.type === Tree.LINE)
    .map(segment => plotRectPathSegment(segment, shape))

  return {type: Tree.IMAGE_SHAPE, shape: {type: Tree.LAYERED_SHAPE, shapes}}
}

function plotRectPathSegment(
  segment: Tree.PathLineSegment,
  shape: Rectangle
): Tree.PolygonShape {
  // Since a rectangular stroke like this is so unique to Gerber, it's easier
  // for downstream graphics generators if we calculate the boundaries of the
  // correct shape and emit a region rather than a path with a width (which is
  // what we do for circle tools)
  const {start, end} = segment
  const [sx, sy] = start
  const [ex, ey] = end
  const [xOffset, yOffset] = [shape.xSize / 2, shape.ySize / 2]
  const theta = Math.atan2(ey - sy, ex - ey)

  const [sxMin, sxMax] = [sx - xOffset, sx + xOffset]
  const [syMin, syMax] = [sy - yOffset, sy + yOffset]
  const [exMin, exMax] = [ex - xOffset, ex + xOffset]
  const [eyMin, eyMax] = [ey - yOffset, ey + yOffset]

  // Go through the quadrants of the XY plane centered about start to decide
  // which segments define the boundaries of the stroke shape
  let points: Tree.Position[] = []
  if (positionsEqual(start, end)) {
    points = [
      [sxMin, syMin],
      [sxMax, syMin],
      [exMax, eyMin],
      [exMax, eyMax],
      [exMin, eyMax],
      [sxMin, syMax],
    ]
  } else if (theta >= 0 && theta < HALF_PI) {
    // First quadrant move
    points = [
      [sxMin, syMin],
      [sxMax, syMin],
      [exMax, eyMin],
      [exMax, eyMax],
      [exMin, eyMax],
      [sxMin, syMax],
    ]
  } else if (theta >= HALF_PI && theta <= PI) {
    // Second quadrant move
    points = [
      [sxMax, syMin],
      [sxMax, syMax],
      [exMax, eyMax],
      [exMin, eyMax],
      [exMin, eyMin],
      [sxMin, syMin],
    ]
  } else if (theta >= -PI && theta < -HALF_PI) {
    // Third quadrant move
    points = [
      [sxMax, syMax],
      [sxMin, syMax],
      [exMin, eyMax],
      [exMin, eyMin],
      [exMax, eyMin],
      [sxMax, syMin],
    ]
  } else {
    // Fourth quadrant move
    points = [
      [sxMin, syMax],
      [sxMin, syMin],
      [exMin, eyMin],
      [exMax, eyMin],
      [exMax, eyMax],
      [sxMax, syMax],
    ]
  }

  return {type: Tree.POLYGON, points}
}
