import type {PathSegment, Position, ArcPosition} from '@tracespace/plotter'

export interface PathWalk {
  start: Position
  end: Position
  segments: PathSegment[]
}

export function walkPaths(segments: PathSegment[]): PathWalk[] {
  const segmentsById = new Map<string, PathSegment>()
  const segmentIdsByPointId = new Map<string, string[]>()

  for (const segment of segments) {
    const segmentId = hashSegment(segment)

    segmentsById.set(segmentId, segment)

    for (const point of [segment.start, segment.end]) {
      const pointId = hashPoint(point)
      const pointSegmentIds = segmentIdsByPointId.get(pointId) ?? []

      pointSegmentIds.push(segmentId)
      segmentIdsByPointId.set(pointId, pointSegmentIds)
    }
  }

  const pointMap: PointMap = Object.assign(Object.create(PointMapPrototype), {
    segmentsById,
    segmentIdsByPointId,
  })

  return pointMap.walk()
}

interface PointMapProperties {
  segmentsById: Map<string, PathSegment>
  segmentIdsByPointId: Map<string, string[]>
}

interface PointMapMethods {
  walkPath(pointId: string): PathSegment[]
  shiftNextSegment(pointId: string): PathSegment | undefined
  shiftSegmentId(pointId: string): string | undefined
  consumeSegment(segmentId: string): PathSegment | undefined
  walk(): PathWalk[]
}

interface PointMap extends PointMapProperties, PointMapMethods {}

const PointMapPrototype: PointMapMethods = {
  walk(this: PointMap): PathWalk[] {
    const results: PathWalk[] = []

    while (this.segmentsById.size > 0) {
      const pointId = this.segmentIdsByPointId.keys().next().value as string
      const segments = this.walkPath(pointId)

      if (segments.length > 0) {
        const firstSegment = segments[0]
        const lastSegment = segments[segments.length - 1]
        const start: Position = [firstSegment.start[0], firstSegment.start[1]]
        const end: Position = [lastSegment.end[0], lastSegment.end[1]]

        results.push({start, end, segments})
      }
    }

    return results
  },

  walkPath(this: PointMap, pointId: string): PathSegment[] {
    const segment = this.shiftNextSegment(pointId)

    if (segment !== undefined) {
      const startId = hashPoint(segment.start)
      const endId = hashPoint(segment.end)
      const nextPointId = pointId === startId ? endId : startId

      return [
        pointId === startId ? segment : reverseSegment(segment),
        ...this.walkPath(nextPointId),
      ]
    }

    return []
  },

  shiftNextSegment(this: PointMap, pointId: string): PathSegment | undefined {
    const segmentId = this.shiftSegmentId(pointId)

    if (segmentId === undefined) {
      return undefined
    }

    return this.consumeSegment(segmentId) ?? this.shiftNextSegment(pointId)
  },

  shiftSegmentId(this: PointMap, pointId: string): string | undefined {
    const segmentIds = this.segmentIdsByPointId.get(pointId)
    const nextId = segmentIds?.shift()

    if (segmentIds?.length === 0) {
      this.segmentIdsByPointId.delete(pointId)
    }

    return nextId
  },

  consumeSegment(this: PointMap, segmentId: string): PathSegment | undefined {
    const segment = this.segmentsById.get(segmentId)
    this.segmentsById.delete(segmentId)
    return segment
  },
}

function hashPoint(point: Position | ArcPosition): string {
  return `${point[0]},${point[1]}`
}

function hashSegment(segment: PathSegment): string {
  const {type} = segment
  const [start, end] = sortPoints(segment.start, segment.end)

  return `${type}:${hashPoint(start)}:${hashPoint(end)}`
}

function sortPoints<P extends Position | ArcPosition>(a: P, b: P): [P, P] {
  if (b[0] < a[0]) return [b, a]
  if (b[0] > a[0]) return [a, b]
  if (b[1] < a[1]) return [b, a]
  return [a, b]
}

export function reverseSegment<S extends PathSegment>(segment: S): S {
  return {...segment, start: segment.end, end: segment.start}
}
