import s from 'hastscript/svg'
import unistMap from 'unist-util-map'
import unistVisit from 'unist-util-visit-parents'

import {
  Board,
  Layer,
  ImageNode,
  ImageLayer,
  IMAGE,
  IMAGE_LAYER,
  IMAGE_SHAPE,
  IMAGE_PATH,
  IMAGE_REGION,
  BoundingBox as BBox,
} from '@tracespace/plotter'

import {SvgElement, SvgRender, SvgLayer} from './types'
import {renderShape, renderPath} from './render'

export const BASE_SVG_PROPS = {
  version: '1.1',
  xmlns: 'http://www.w3.org/2000/svg',
  'xmlns:xlink': 'http://www.w3.org/1999/xlink',
  'stroke-linecap': 'round',
  'stroke-linejoin': 'round',
  'stroke-width': '0',
  'fill-rule': 'evenodd',
  fill: 'currentColor',
  stroke: 'currentColor',
}

export function createRender(board: Board): SvgRender {
  return {layers: board.layers.map(renderLayer)}
}

export function renderLayer(layer: Layer): SvgLayer {
  const svgRender = unistMap(layer.image, mapImageTreeToSvg)

  if (svgRender.properties) {
    const {width, height} = svgRender.properties
    if (typeof width === 'number') {
      svgRender.properties.width = `${width}${layer.units}`
    }
    if (typeof height === 'number') {
      svgRender.properties.height = `${height}${layer.units}`
    }
  }

  return {...layer, svgRender}
}

function mapImageTreeToSvg(node: ImageNode): SvgElement {
  switch (node.type) {
    case IMAGE: {
      let box = BBox.empty()
      unistVisit(node, IMAGE_LAYER, (layer: ImageLayer) => {
        box = BBox.add(box, layer.size)
      })
      const [xMin, yMin, width, height] = BBox.toViewBox(box)
      const props = {
        ...BASE_SVG_PROPS,
        width,
        height,
        viewBox: `${xMin} ${yMin} ${width} ${height}`,
      }
      return s('svg', props)
    }

    case IMAGE_LAYER: {
      const vbox = BBox.toViewBox(node.size)
      return s('g', {
        transform: `translate(0, ${vbox[3] + 2 * vbox[1]}) scale(1,-1)`,
      })
    }

    case IMAGE_SHAPE: {
      return renderShape(node)
    }

    case IMAGE_PATH:
    case IMAGE_REGION: {
      return renderPath(node)
    }
  }

  return s('metadata', [JSON.stringify(node)])
}
