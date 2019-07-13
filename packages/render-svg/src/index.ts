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
  BoundingBox as BBox,
} from '@tracespace/builder'

import {SvgElement, SvgRender, SvgLayer} from './types'
import {renderShape} from './render'

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
      const [xMin, yMin, xMax, yMax] = box
      const width = xMax - xMin
      const height = yMax - yMin
      const viewBox = `${xMin} ${yMin} ${width} ${height}`
      return s('svg', {width, height, viewBox})
    }

    case IMAGE_LAYER: {
      return s('g')
    }

    case IMAGE_SHAPE: {
      return renderShape(node)
    }
  }

  return s('metadata')
}
