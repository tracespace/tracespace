// adds a path segment to the current ImagePath or returns a new ImagePath
// if the tool has changed
import {ToolDefinition, CIRCLE} from '@tracespace/parser'
import {ImagePath, PathSegment, IMAGE_PATH, LINE} from './nodes'

export function addSegment(
  path: ImagePath | null,
  tool: ToolDefinition,
  start: [number, number],
  end: [number, number],
  region: boolean
): ImagePath {
  if (region) {
    throw new Error('umimplemented')
  }

  if (tool.shape.type !== CIRCLE) {
    throw new Error('unimplemented')
  }

  const segment: PathSegment = {type: LINE, start, end}

  if (!path || path.width !== tool.shape.diameter) {
    path = {
      type: IMAGE_PATH,
      width: tool.shape.diameter,
      segments: [segment],
    }
  } else {
    path.segments.push(segment)
  }

  return path
}
