// @tracespace/plotter
// build abstract board images from @tracespace/parser ASTs
import {GerberTree} from '@tracespace/parser'

import {getPlotOptions} from './options'
import {createPlot} from './plot-tree'
import {ImageTree} from './tree'

export * from './tree'
export * from './types'

export function plot(tree: GerberTree): ImageTree {
  const plotOptions = getPlotOptions(tree)
  const imageTree = createPlot(tree, plotOptions)

  return imageTree
}
