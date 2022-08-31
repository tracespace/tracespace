// Main layer
// Collects graphic objects onto the main layer, transforming as necessary
import type {GerberNode} from '@tracespace/parser'

import * as BoundingBox from './bounding-box'
import type {ImageLayer, ImageGraphic} from './tree'
import {IMAGE_LAYER} from './tree'

export interface MainLayer {
  get(): ImageLayer
  add(node: GerberNode, graphic: ImageGraphic[]): ImageLayer
}

export function createMainLayer(): MainLayer {
  return Object.create(MainLayerPrototype)
}

interface MainLayerState {
  _layer: ImageLayer | undefined
}

const MainLayerPrototype: MainLayer & MainLayerState = {
  _layer: undefined,

  get(): ImageLayer {
    this._layer = this._layer ?? {
      type: IMAGE_LAYER,
      size: BoundingBox.empty(),
      children: [],
    }

    return this._layer
  },

  add(node: GerberNode, graphics: ImageGraphic[]): ImageLayer {
    const layer = this.get()

    for (const graphic of graphics) {
      const graphicSize = BoundingBox.fromGraphic(graphic)
      layer.size = BoundingBox.add(layer.size, graphicSize)
      layer.children.push(graphic)
    }

    return layer
  },
}
