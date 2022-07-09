// @tracespace/plotter
// build abstract board images from @tracespace/parser ASTs
import {GerberTree} from '@tracespace/parser'

import {getPlotOptions} from './options'
import {createToolStore} from './tool-store'
import {createLocationStore} from './location-store'
import {createMainLayer} from './main-layer'
import {createGraphicPlotter} from './graphic-plotter'
import {IMAGE, ImageTree} from './tree'

export * from './tree'
export * as BoundingBox from './bounding-box'
export {positionsEqual} from './coordinate-math'

export function plot(tree: GerberTree): ImageTree {
  const plotOptions = getPlotOptions(tree)
  const toolStore = createToolStore()
  const locationStore = createLocationStore()
  const mainLayer = createMainLayer()
  const graphicPlotter = createGraphicPlotter(tree.filetype)
  let result = mainLayer.get()

  for (const node of tree.children) {
    const tool = toolStore.use(node)
    const location = locationStore.use(node, plotOptions)
    const graphics = graphicPlotter.plot(node, tool, location)
    result = mainLayer.add(node, graphics)
  }

  return {type: IMAGE, units: plotOptions.units, children: [result]}
}
