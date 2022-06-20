// General graphic plotter
// Takes graphic nodes and turns them into graphics to be added to the image
import {Child} from '@tracespace/parser'

import {PlotOptions} from '../options'
import {Tool} from '../tool-store'
import {Shape, PathSegment} from '../tree'

export interface GraphicPlotter {
  plot(
    node: Child,
    tool: Tool | null,
    options: PlotOptions
  ): Shape | PathSegment
}

export function createGraphicPlotter(): GraphicPlotter {
  return Object.create(GraphicPlotterPrototype)
}

const GraphicPlotterPrototype: GraphicPlotter = {
  plot(
    node: Child,
    tool: Tool | null,
    options: PlotOptions
  ): Shape | PathSegment {
    void node
    void tool
    void options
    throw new Error('not implemented')
  },
}
