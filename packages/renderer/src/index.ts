import {s} from 'hastscript'
import {map} from 'unist-util-map'
import {visitParents} from 'unist-util-visit-parents'

import {
  ImageTree,
  ImageNode,
  ImageLayer,
  IMAGE,
  IMAGE_LAYER,
  IMAGE_SHAPE,
  IMAGE_PATH,
  IMAGE_REGION,
  BoundingBox as BBox,
} from '@tracespace/plotter'

import {renderShape, renderPath} from './render'
import type {SvgElement} from './types'

export type {SvgElement} from './types'

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

export function render(image: ImageTree): SvgElement {
  const svgTree = map(image, mapImageTreeToSvg)

  if (svgTree.properties) {
    const {width, height} = svgTree.properties

    if (typeof width === 'number') {
      svgTree.properties.width = `${width}${image.units}`
    }

    if (typeof height === 'number') {
      svgTree.properties.height = `${height}${image.units}`
    }
  }

  return svgTree
}

function mapImageTreeToSvg(node: ImageNode): SvgElement {
  switch (node.type) {
    case IMAGE: {
      let box = BBox.empty()
      visitParents(node, IMAGE_LAYER, (layer: ImageLayer) => {
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
