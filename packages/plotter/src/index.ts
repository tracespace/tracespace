// @tracespace/plotter
// build abstract board images from @tracespace/parser ASTs
import {GerberTree} from '@tracespace/parser'

import {getPlotOptions} from './options'
import {createToolStore} from './tool-store'
import {createLocationStore} from './location-store'
import {createMainLayer} from './main-layer'
import {createGraphicPlotter} from './plot-tree'
import {IMAGE, IMAGE_LAYER, ImageTree, ImageLayer} from './tree'

export {BoundingBox, getShapeBox, positionsEqual} from './plot-tree'
export * from './tree'

export function plot(tree: GerberTree): ImageTree {
  const plotOptions = getPlotOptions(tree)
  const toolStore = createToolStore()
  const locationStore = createLocationStore()
  const mainLayer = createMainLayer()
  const graphicPlotter = createGraphicPlotter()

  let result: ImageLayer = {
    type: IMAGE_LAYER,
    size: [0, 0, 0, 0],
    children: [],
  }

  for (const node of tree.children) {
    const tool = toolStore.use(node)
    const location = locationStore.use(node, plotOptions)
    const graphic = graphicPlotter.plot(node, tool, location, plotOptions)
    result = mainLayer.add(graphic)
  }

  return {type: IMAGE, units: plotOptions.units, children: [result]}
}
