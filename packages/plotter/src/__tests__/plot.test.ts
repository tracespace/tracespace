import {vi, describe, it, afterEach, expect} from 'vitest'
import * as td from 'testdouble'

import * as Parser from '@tracespace/parser'
import * as Tree from '../tree'
import {PlotOptions, getPlotOptions} from '../options'
import {createPlot} from '../plot-tree'
import {plot} from '..'

vi.mock('../options', () => td.object<unknown>())
vi.mock('../plot-tree', () => td.object<unknown>())

describe('plot', () => {
  afterEach(() => {
    td.reset()
  })

  it('should get plot options and plot', () => {
    const tree = {type: Parser.ROOT} as Parser.GerberTree
    const plotOptions = {units: Parser.MM} as PlotOptions
    const imageTree = {type: Tree.IMAGE} as Tree.ImageTree

    td.when(getPlotOptions(tree)).thenReturn(plotOptions)
    td.when(createPlot(tree, plotOptions)).thenReturn(imageTree)

    const result = plot(tree)
    expect(result).to.eql(imageTree)
  })
})
