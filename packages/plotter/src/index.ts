// @tracespace/plotter
// build abstract board images from @tracespace/parser ASTs
import type {GerberTree} from '@tracespace/parser'

import {fromGraphics as sizeFromGraphics} from './bounding-box'
import {getPlotOptions} from './options'
import {createToolStore} from './tool-store'
import {createLocationStore} from './location-store'
import {createGraphicPlotter} from './graphic-plotter'
import {IMAGE} from './tree'
import type {ImageTree} from './tree'

export * from './tree'
export * as BoundingBox from './bounding-box'
export {TWO_PI, positionsEqual} from './coordinate-math'

export function plot(tree: GerberTree): ImageTree {
  const plotOptions = getPlotOptions(tree)
  const toolStore = createToolStore()
  const locationStore = createLocationStore()
  const graphicPlotter = createGraphicPlotter(tree.filetype)
  const children = []

  for (const node of tree.children) {
    const tool = toolStore.use(node)
    const location = locationStore.use(node, plotOptions)
    const graphics = graphicPlotter.plot(node, tool, location)

    children.push(...graphics)
  }

  return {
    type: IMAGE,
    units: plotOptions.units,
    size: sizeFromGraphics(children),
    children,
  }
}
