// adds a path segment to the current ImagePath or returns a new ImagePath
// if the tool has changed
import {
  ToolDefinition,
  InterpolateModeType,
  QuadrantModeType,
  CIRCLE as PARSER_CIRCLE,
  RECTANGLE as PARSER_RECTANGLE,
  LINE as PARSER_LINE,
  CW_ARC as PARSER_CW_ARC,
  CCW_ARC as PARSER_CCW_ARC,
} from '@tracespace/parser'

import {Box, Position, Offsets} from '../types'
import {rotateQuadrant, limitAngle, TWO_PI} from '../utils'
import * as BBox from './bounding-box'
import {line} from './geometry'
import {makeArcSegment} from './arc-segment'
import {plotRectPath} from './plot-rect-path'

import {
  ImagePath,
  ImageRegion,
  OutlineShape,
  ClearOutlineShape,
  PathSegment,
  IMAGE_PATH,
  IMAGE_REGION,
  ARC,
  CCW,
} from './nodes'

export function pathFinished(
  path: ImagePath | ImageRegion,
  tool: ToolDefinition | null,
  regionMode: boolean
): boolean {
  return (
    // path is done if region mode has switched
    (path.type === IMAGE_REGION && regionMode === false) ||
    (path.type === IMAGE_PATH && regionMode === true) ||
    // if we drew a convenience region (e.g rectangular stroke) but now we're
    // doing a region for real, we need to end the path
    (path.type === IMAGE_REGION &&
      regionMode === true &&
      path.meta.regionMode === false) ||
    // path is done if the tool is a circle and the diameter has changed
    (path.type === IMAGE_PATH &&
      tool !== null &&
      tool.shape.type === PARSER_CIRCLE &&
      tool.shape.diameter !== path.width) ||
    // only use one path per non-region rectangular tool stroke
    (regionMode === false &&
      tool !== null &&
      tool.shape.type === PARSER_RECTANGLE)
  )
}

export function addSegmentToPath(
  path: ImagePath | ImageRegion | null,
  start: Position,
  end: Position,
  offsets: Offsets,
  tool: ToolDefinition | null,
  interpolateMode: InterpolateModeType,
  regionMode: boolean,
  quadrantMode: QuadrantModeType
): ImagePath | ImageRegion {
  if (!regionMode && tool && tool.shape.type === PARSER_RECTANGLE) {
    return plotRectPath(start, end, tool.shape)
  }

  const diameter =
    tool && tool.shape.type === PARSER_CIRCLE ? tool.shape.diameter : 0

  let segment: PathSegment | null = null

  if (interpolateMode === PARSER_LINE) {
    segment = line(start, end)
  } else if (
    interpolateMode === PARSER_CW_ARC ||
    interpolateMode === PARSER_CCW_ARC
  ) {
    segment = makeArcSegment(start, end, offsets, interpolateMode, quadrantMode)
  }

  let nextPath: ImagePath | ImageRegion | null = path

  if (!nextPath) {
    nextPath = regionMode
      ? {type: IMAGE_REGION, segments: [], meta: {regionMode: true}}
      : {type: IMAGE_PATH, width: diameter, segments: []}
  }

  if (segment) nextPath.segments.push(segment)

  return nextPath
}

export function getPathBox(
  path: ImagePath | ImageRegion | OutlineShape | ClearOutlineShape
): Box {
  return path.segments.reduce((box, segment) => {
    const rTool = path.type === IMAGE_PATH ? path.width / 2 : 0
    const keyPoints = [segment.start, segment.end]

    if (segment.type === ARC) {
      const {start, end, center, sweep, radius} = segment
      // normalize direction to counter-clockwise
      let [thetaStart, thetaEnd] =
        segment.direction === CCW ? [start[2], end[2]] : [end[2], start[2]]

      thetaStart = limitAngle(thetaStart)
      thetaEnd = limitAngle(thetaEnd)

      const axisPoints: Position[] = [
        [center[0] + radius, center[1]],
        [center[0], center[1] + radius],
        [center[0] - radius, center[1]],
        [center[0], center[1] - radius],
      ]

      axisPoints.forEach(p => {
        if (thetaStart > thetaEnd || sweep === TWO_PI) keyPoints.push(p)
        // rotate to check for next axis key point
        thetaStart = rotateQuadrant(thetaStart)
        thetaEnd = rotateQuadrant(thetaEnd)
      })
    }

    keyPoints
      .map(p => BBox.fromCircle(p[0], p[1], rTool))
      .forEach(b => (box = BBox.add(box, b)))

    return box
  }, BBox.empty())
}
