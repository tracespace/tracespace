import {s} from 'hastscript'

import {random as createId} from '@tracespace/xml-id'
import {
  BoundingBox,
  positionsEqual,
  ImageShape,
  ImagePath,
  ImageRegion,
  PathSegment,
  Shape,
  IMAGE_PATH,
  CIRCLE,
  RECTANGLE,
  POLYGON,
  OUTLINE,
  CLEAR_OUTLINE,
  LAYERED_SHAPE,
  LINE,
  ARC,
  CW,
} from '@tracespace/plotter'

import type {SvgElement} from './types'

export function renderShape(node: ImageShape): SvgElement {
  const {shape} = node

  return shapeToElement(shape)
}

export function shapeToElement(shape: Shape): SvgElement {
  switch (shape.type) {
    case CIRCLE: {
      const {cx, cy, r} = shape
      return s('circle', {cx, cy, r})
    }

    case RECTANGLE: {
      const {x, y, xSize: width, ySize: height, r} = shape
      return s('rect', {x, y, width, height, rx: r, ry: r})
    }

    case POLYGON: {
      const points = shape.points.map(p => p.join(',')).join(' ')
      return s('polygon', {points})
    }

    case OUTLINE: {
      return s('path', {d: segmentsToPathData(shape.segments)})
    }

    case LAYERED_SHAPE: {
      const [bx1, by1, bx2, by2] = BoundingBox.fromShape(shape)
      const clipIdBase = createId()
      const defs: SvgElement[] = []
      let children: SvgElement[] = []

      for (const [i, layerShape] of shape.shapes.entries()) {
        if (layerShape.type === CLEAR_OUTLINE) {
          const clipId = `${clipIdBase}__${i}`
          const boundingPath = `M${bx1} ${by1} H${bx2} V${by2} H${bx1} V${by1}`
          const clearPath = segmentsToPathData(layerShape.segments)

          defs.push(
            s('clipPath', {id: clipId}, [
              s('path', {
                d: `${boundingPath} ${clearPath}`,
                clipRule: 'evenodd',
              }),
            ])
          )

          children = [s('g', {clipPath: `url(#${clipId})`}, children)]
        } else {
          children.push(shapeToElement(layerShape))
        }
      }

      if (defs.length > 0) children.unshift(s('defs', defs))
      if (children.length === 1) return children[0]
      return s('g', children)
    }

    default: {
      return s('g')
    }
  }
}

export function renderPath(node: ImagePath | ImageRegion): SvgElement {
  const pathData = segmentsToPathData(node.segments)
  const props =
    node.type === IMAGE_PATH ? {strokeWidth: node.width, fill: 'none'} : {}

  return s('path', {...props, d: pathData})
}

function segmentsToPathData(segments: PathSegment[]): string {
  const pathCommands: string[] = []

  for (const [i, next] of segments.entries()) {
    const previous = segments[i - 1]
    const {start, end} = next

    if (!previous || !positionsEqual(previous.end, start)) {
      pathCommands.push(`M${start[0]} ${start[1]}`)
    }

    if (next.type === LINE) {
      pathCommands.push(`L${end[0]} ${end[1]}`)
    } else if (next.type === ARC) {
      const {center, radius, sweep, direction} = next

      // Sweep flag flipped from SVG value because Y-axis is positive-down
      const sweepFlag = direction === CW ? '0' : '1'
      let largeFlag = sweep <= Math.PI ? '0' : '1'

      // A full circle needs two SVG arcs to draw
      if (sweep === 2 * Math.PI) {
        const [mx, my] = [2 * center[0] - end[0], 2 * center[1] - end[1]]
        largeFlag = '0'
        pathCommands.push(`A${radius} ${radius} 0 0 ${sweepFlag} ${mx} ${my}`)
      }

      pathCommands.push(
        `A${radius} ${radius} 0 ${largeFlag} ${sweepFlag} ${end[0]} ${end[1]}`
      )
    }
  }

  return pathCommands.join('')
}
