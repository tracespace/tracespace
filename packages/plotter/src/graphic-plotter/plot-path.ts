import * as Tree from '../tree'
import {Location} from '../location-store'
import {TWO_PI} from '../coordinate-math'

import {line, arc} from './geometry'

export function plotSegment(
  location: Location,
  arcDirection?: Tree.ArcDirection
): Tree.PathSegment {
  return arcDirection === undefined
    ? createLineSegment(location)
    : createArcSegment(location, arcDirection)
}

function createLineSegment(location: Location): Tree.PathLineSegment {
  return line({
    start: [location.startPoint.x, location.startPoint.y],
    end: [location.endPoint.x, location.endPoint.y],
  })
}

function createArcSegment(
  location: Location,
  arcDirection: Tree.ArcDirection
): Tree.PathArcSegment {
  const {startPoint, endPoint, arcOffsets} = location

  return arc({
    start: [startPoint.x, startPoint.y, 0],
    end: [endPoint.x, endPoint.y, TWO_PI],
    center: [startPoint.x + arcOffsets.i, startPoint.y + arcOffsets.j],
    radius: (arcOffsets.i ** 2 + arcOffsets.j ** 2) ** 0.5,
    sweep: TWO_PI,
    direction: arcDirection,
  })
}
// // Adds a path segment to the current ImagePath or returns a new ImagePath
// // if the tool has changed
// import {
//   ToolDefinition,
//   InterpolateModeType,
//   QuadrantModeType,
//   CIRCLE as PARSER_CIRCLE,
//   RECTANGLE as PARSER_RECTANGLE,
//   LINE as PARSER_LINE,
//   CW_ARC as PARSER_CW_ARC,
//   CCW_ARC as PARSER_CCW_ARC,
// } from '@tracespace/parser'

// import {
//   IMAGE_PATH,
//   IMAGE_REGION,
//   Position,
//   ImagePath,
//   ImageRegion,
//   PathSegment,
// } from '../tree'

// import {line} from './geometry'
// import {makeArcSegment} from './arc-segment'
// import {plotRectPath} from './plot-rect-path'

// export function pathFinished(
//   path: ImagePath | ImageRegion,
//   tool: ToolDefinition | null,
//   regionMode: boolean
// ): boolean {
//   return (
//     // Path is done if region mode has switched
//     (path.type === IMAGE_REGION && !regionMode) ||
//     (path.type === IMAGE_PATH && regionMode) ||
//     // If we drew a convenience region (e.g rectangular stroke) but now we're
//     // doing a region for real, we need to end the path
//     (path.type === IMAGE_REGION && regionMode && !path.meta.regionMode) ||
//     // Path is done if the tool is a circle and the diameter has changed
//     (path.type === IMAGE_PATH &&
//       tool !== null &&
//       tool.shape.type === PARSER_CIRCLE &&
//       tool.shape.diameter !== path.width) ||
//     // Only use one path per non-region rectangular tool stroke
//     (!regionMode && tool !== null && tool.shape.type === PARSER_RECTANGLE)
//   )
// }

// export interface AddSegmentToPathOptions {
//   path: ImagePath | ImageRegion | null
//   start: Position
//   end: Position
//   offsets: Offsets
//   tool: ToolDefinition | null
//   interpolateMode: InterpolateModeType
//   regionMode: boolean
//   quadrantMode: QuadrantModeType
// }

// export function addSegmentToPath({
//   path,
//   start,
//   end,
//   offsets,
//   tool,
//   interpolateMode,
//   regionMode,
//   quadrantMode,
// }: AddSegmentToPathOptions): ImagePath | ImageRegion {
//   if (!regionMode && tool && tool.shape.type === PARSER_RECTANGLE) {
//     return plotRectPath(start, end, tool.shape)
//   }

//   const diameter =
//     tool && tool.shape.type === PARSER_CIRCLE ? tool.shape.diameter : 0

//   let segment: PathSegment | null = null

//   if (interpolateMode === PARSER_LINE) {
//     segment = line({start, end})
//   } else if (
//     interpolateMode === PARSER_CW_ARC ||
//     interpolateMode === PARSER_CCW_ARC
//   ) {
//     segment = makeArcSegment({
//       start,
//       end,
//       offsets,
//       interpolateMode,
//       quadrantMode,
//     })
//   }

//   let nextPath: ImagePath | ImageRegion | null = path

//   if (!nextPath) {
//     nextPath = regionMode
//       ? {type: IMAGE_REGION, segments: [], meta: {regionMode: true}}
//       : {type: IMAGE_PATH, width: diameter, segments: []}
//   }

//   if (segment) nextPath.segments.push(segment)

//   return nextPath
// }
