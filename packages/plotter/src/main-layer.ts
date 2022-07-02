// Graphic store
// Keeps track of plotted graphics
import {ImageLayer, ImageShape} from './tree'

export interface MainLayer {
  add(graphic: ImageShape): ImageLayer
}

export function createMainLayer(): MainLayer {
  throw new Error('not implemented')
}
