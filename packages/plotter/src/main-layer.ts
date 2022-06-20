// Graphic store
// Keeps track of plotted graphics
import {ImageLayer, PathSegment, Shape} from './tree'

export interface MainLayer {
  add(graphic: Shape | PathSegment): ImageLayer
}

export function createMainLayer(): MainLayer {
  throw new Error('not implemented')
}
