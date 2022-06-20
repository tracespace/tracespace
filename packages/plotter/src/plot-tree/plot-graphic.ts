// General graphic plotter
// Takes graphic nodes and turns them into graphics to be added to the image
import {Child, ToolDefinition} from '@tracespace/parser'

import {PlotOptions} from '../options'
import {Shape, PathSegment} from '../tree'

export function plotGraphic(
  node: Child,
  tool: ToolDefinition | null,
  options: PlotOptions
): Shape | PathSegment {
  void node
  void tool
  void options
  throw new Error('not implemented')
}
