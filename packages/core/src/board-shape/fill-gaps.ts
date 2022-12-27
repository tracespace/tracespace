import {LINE, IMAGE_REGION, IMAGE_PATH} from '@tracespace/plotter'

import type {
  ImagePath,
  ImageRegion,
  PathSegment,
  Position,
} from '@tracespace/plotter'
import type {PathWalk} from './walk-paths'

import {reverseSegment} from './walk-paths'

const segmentsToRegion = (segments: PathSegment[]): ImageRegion => ({
  type: IMAGE_REGION,
  segments,
})

const segmentsToPath = (segments: PathSegment[]): ImagePath => ({
  type: IMAGE_PATH,
  width: 0,
  segments,
})

export function fillGaps(
  pathWalks: PathWalk[],
  maximumGap: number
): [regions: ImageRegion[], openPaths: ImagePath[]] {
  const maximumSquareGap = maximumGap ** 2
  const walksToCheck: PathWalk[] = [...pathWalks]
  const closedPaths: PathSegment[][] = []
  const openPaths: PathSegment[][] = []

  while (walksToCheck.length > 0) {
    const pathWalk = walksToCheck.shift()!
    let smallestGap = squareDistance(pathWalk.end, pathWalk.start)
    let nearestPathWalk = pathWalk
    let nearestEndPoint = pathWalk.start

    if (smallestGap === 0) {
      closedPaths.push(pathWalk.segments)
      continue
    }

    for (const otherWalk of walksToCheck) {
      for (const otherEndPoint of [otherWalk.start, otherWalk.end]) {
        const gap = squareDistance(pathWalk.end, otherEndPoint)
        if (gap < smallestGap) {
          smallestGap = gap
          nearestPathWalk = otherWalk
          nearestEndPoint = otherEndPoint
        }
      }
    }

    if (smallestGap <= maximumSquareGap) {
      const gapFill: PathSegment = {
        type: LINE,
        start: pathWalk.end,
        end: nearestEndPoint,
      }

      if (pathWalk === nearestPathWalk) {
        closedPaths.push([...pathWalk.segments, gapFill])
        continue
      }

      const nearestPathWalkIndex = walksToCheck.indexOf(nearestPathWalk)
      if (nearestPathWalkIndex !== -1) {
        walksToCheck.splice(nearestPathWalkIndex, 1)
      }

      const nearestPathSegments =
        nearestEndPoint === nearestPathWalk.start
          ? nearestPathWalk.segments
          : nearestPathWalk.segments.map(reverseSegment).reverse()

      const nearestPathEnd =
        nearestEndPoint === nearestPathWalk.start
          ? nearestPathWalk.end
          : nearestPathWalk.start

      walksToCheck.unshift({
        start: pathWalk.start,
        end: nearestPathEnd,
        segments: [...pathWalk.segments, gapFill, ...nearestPathSegments],
      })
    } else {
      openPaths.push(pathWalk.segments)
    }
  }

  return [closedPaths.map(segmentsToRegion), openPaths.map(segmentsToPath)]
}

function squareDistance(a: Position, b: Position): number {
  return a[0] !== b[0] || a[1] !== b[1]
    ? (a[0] - b[0]) ** 2 + (a[1] - b[1]) ** 2
    : 0
}
