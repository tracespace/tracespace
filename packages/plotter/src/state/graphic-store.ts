// Graphic store
// Keeps track of plotted graphics
import {ImageLayer, PathSegment, Shape} from '../tree'

export interface GraphicStore {
  add(graphic: Shape | PathSegment): ImageLayer
}

export function createGraphicStore(): GraphicStore {
  throw new Error('not implemented')
}
