import {s} from 'hastscript'

import {random as createId} from '@tracespace/xml-id'
import type {
  ImageGraphic,
  ImageShape,
  ImagePath,
  ImageRegion,
  PathSegment,
  Shape,
} from '@tracespace/plotter'
import {
  BoundingBox,
  positionsEqual,
  IMAGE_SHAPE,
  IMAGE_PATH,
  CIRCLE,
  RECTANGLE,
  POLYGON,
  OUTLINE,
  LAYERED_SHAPE,
  LINE,
} from '@tracespace/plotter'

import type {SvgElement} from './types'

export function renderGraphic(node: ImageGraphic): SvgElement {
  if (node.type === IMAGE_SHAPE) {
    return renderShape(node)
  }

  return renderPath(node)
}

export function renderShape(node: ImageShape): SvgElement {
  const {shape} = node

  return shapeToElement(shape)
}

export function shapeToElement(shape: Shape): SvgElement {
  switch (shape.type) {
    case CIRCLE: {
      const {cx, cy, r} = shape
      return s('circle', {cx, cy: -cy, r})
    }

    case RECTANGLE: {
      const {x, y, xSize: width, ySize: height, r} = shape
      return s('rect', {
        x,
        y: -y - height,
        width,
        height,
        rx: r,
        ry: r,
      })
    }

    case POLYGON: {
      const points = shape.points.map(([x, y]) => `${x},${-y}`).join(' ')

      return s('polygon', {points})
    }

    case OUTLINE: {
      return s('path', {d: segmentsToPathData(shape.segments)})
    }

    case LAYERED_SHAPE: {
      const boundingBox = BoundingBox.fromShape(shape)
      const clipIdBase = createId()
      const defs: SvgElement[] = []
      let children: SvgElement[] = []

      for (const [index, layerShape] of shape.shapes.entries()) {
        if (layerShape.erase === true && !BoundingBox.isEmpty(boundingBox)) {
          const clipId = `${clipIdBase}__${index}`

          defs.push(s('clipPath', {id: clipId}, [shapeToElement(layerShape)]))
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

  for (const [index, next] of segments.entries()) {
    const previous = index > 0 ? segments[index - 1] : undefined
    const {start, end} = next

    if (previous === undefined || !positionsEqual(previous.end, start)) {
      pathCommands.push(`M${start[0]} ${-start[1]}`)
    }

    if (next.type === LINE) {
      pathCommands.push(`L${end[0]} ${-end[1]}`)
    } else {
      const {start: nextStart, end: nextEnd} = next
      const sweep = nextEnd[2] - nextStart[2]
      const absSweep = Math.abs(sweep)
      const {center, radius} = next

      // Sweep flag flipped from SVG value because Y-axis is positive-down
      const sweepFlag = sweep < 0 ? '1' : '0'
      let largeFlag = absSweep <= Math.PI ? '0' : '1'

      // A full circle needs two SVG arcs to draw
      if (absSweep === 2 * Math.PI) {
        const [mx, my] = [2 * center[0] - end[0], -(2 * center[1] - end[1])]
        largeFlag = '0'
        pathCommands.push(`A${radius} ${radius} 0 0 ${sweepFlag} ${mx} ${my}`)
      }

      pathCommands.push(
        `A${radius} ${radius} 0 ${largeFlag} ${sweepFlag} ${end[0]} ${-end[1]}`
      )
    }
  }

  return pathCommands.join('')
}
