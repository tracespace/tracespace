import {s} from 'hastscript'

import {random as createId} from '@tracespace/xml-id'
import type {
  ImageGraphicBase,
  ImageShape,
  ImagePath,
  ImageRegion,
  PathSegment,
  Shape,
  ImageTree,
  SizeEnvelope,
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
import {DARK, CLEAR} from '@tracespace/parser'

import type {SvgElement, ViewBox} from './types'

export function renderTreeGraphics(tree: ImageTree): SvgElement[] {
  const {size, children} = tree
  const viewBox = sizeToViewBox(size)
  const clipIdBase = createId()

  const defs: SvgElement[] = []
  let layerTree: SvgElement[] = []
  const layerChildren: SvgElement[] = []
  const layerHoles: SvgElement[] = []

  for (const [index, child] of children.entries()) {
    if (child.polarity === DARK) {
      layerChildren.push(renderGraphic(child))
    } else if (child.polarity === CLEAR) {
      layerHoles.push(renderGraphic(child))
      if (
        index >= children.length - 1 ||
        children[index + 1].polarity === DARK
      ) {
        const clipId = `${clipIdBase}__${index}`
        const rect = s('rect', {
          x: viewBox[0],
          y: viewBox[1],
          width: viewBox[2],
          height: viewBox[3],
          fill: 'white',
        })
        defs.push(s('mask', {id: clipId, fill: 'black'}, [rect, ...layerHoles]))
        layerTree = [
          s('g', {mask: `url(#${clipId})`}, [...layerChildren, ...layerTree]),
        ]
        layerChildren.length = 0
        layerHoles.length = 0
      }
    }
  }
  layerTree.push(...layerChildren)
  return [s('defs', defs), ...layerTree]
}

export function sizeToViewBox(size: SizeEnvelope): ViewBox {
  return BoundingBox.isEmpty(size)
    ? [0, 0, 0, 0]
    : [size[0], -size[3], size[2] - size[0], size[3] - size[1]]
}

export function renderGraphic(node: ImageGraphicBase): SvgElement {
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
          const rect = s('rect', {
            x: boundingBox[0],
            y: -boundingBox[3],
            width: boundingBox[2] - boundingBox[0],
            height: boundingBox[3] - boundingBox[1],
            fill: 'white',
          })
          const hole = shapeToElement(layerShape)
          defs.push(s('mask', {id: clipId, fill: 'black'}, [rect, hole]))
          children = [s('g', {mask: `url(#${clipId})`}, children)]
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
