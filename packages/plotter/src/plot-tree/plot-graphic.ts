// General graphic plotter
// Takes graphic nodes and turns them into graphics to be added to the image
import {Child} from '@tracespace/parser'

import {Tool} from '../tool-store'
import {Location} from '../location-store'
import {IMAGE_SHAPE, ImageShape} from '../tree'

import {plotShape} from './plot-shape'

export interface GraphicPlotter {
  plot(node: Child, tool: Tool | undefined, location: Location): ImageShape
}

export function createGraphicPlotter(): GraphicPlotter {
  return Object.create(GraphicPlotterPrototype)
}

const GraphicPlotterPrototype: GraphicPlotter = {
  plot(node: Child, tool: Tool | undefined, location: Location): ImageShape {
    return {
      type: IMAGE_SHAPE,
      shape: plotShape(tool, location.endPoint),
    }
  },
}
