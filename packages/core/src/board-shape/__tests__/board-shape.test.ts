import {describe, beforeEach, afterEach, it, expect} from 'vitest'
import {replaceEsm, reset} from 'testdouble-vitest'
import * as td from 'testdouble'

import type {ImageTree} from '@tracespace/plotter'
import type {Layer} from '../..'

describe('board shape', () => {
  let plotter: typeof import('@tracespace/plotter')
  let layerSorter: typeof import('../../sort-layers')
  let segmentWalker: typeof import('../walk-paths')
  let gapFiller: typeof import('../fill-gaps')
  let subject: typeof import('..')

  beforeEach(async () => {
    plotter = await replaceEsm('@tracespace/plotter')
    layerSorter = await replaceEsm('../../sort-layers')
    segmentWalker = await replaceEsm('../walk-paths')
    gapFiller = await replaceEsm('../fill-gaps')
    subject = await import('..')
  })

  afterEach(() => {
    reset()
  })

  it('should return a failure reason if no outline layer', () => {
    td.when(plotter.BoundingBox.sum([])).thenReturn([1, 2, 3, 4])

    const result = subject.plotBoardShape([], {}, 0.123)

    expect(result).to.eql({
      failureReason: 'missingOutlineLayer',
      size: [1, 2, 3, 4],
      regions: [],
      openPaths: [],
    })
  })

  it('should return a failure reason if outline layer has no path', () => {
    const layers = [{id: 'layer-id'} as Layer]
    const plotTreesById: Record<string, ImageTree> = {
      outline: {
        type: plotter.IMAGE,
        units: 'mm',
        size: [1, 2, 3, 4],
        children: [],
        tools: {},
      },
    }

    td.when(layerSorter.getOutlineLayer(layers)).thenReturn('outline')
    td.when(plotter.BoundingBox.sum([[1, 2, 3, 4]])).thenReturn([5, 6, 7, 8])

    const result = subject.plotBoardShape(layers, plotTreesById, 0.123)

    expect(result).to.eql({
      failureReason: 'noPathsInOutlineLayer',
      size: [5, 6, 7, 8],
      regions: [],
      openPaths: [],
    })
  })

  it('should walk the segments of an outline layer', () => {
    const layers = [{id: 'outline'} as Layer]
    const plotTreesById = {
      outline: {
        type: plotter.IMAGE,
        size: [5, 6, 7, 8],
        children: [
          {
            type: plotter.IMAGE_PATH,
            width: 1,
            segments: [{type: plotter.LINE, start: [0, 0], end: [0, 1]}],
          },
        ],
      } as ImageTree,
    }

    td.when(layerSorter.getOutlineLayer(layers)).thenReturn('outline')

    td.when(
      segmentWalker.walkPaths([
        {type: plotter.LINE, start: [0, 0], end: [0, 1]},
      ])
    ).thenReturn([
      {
        start: [0, 1],
        end: [1, 1],
        segments: [{type: plotter.LINE, start: [0, 1], end: [1, 1]}],
      },
    ])

    td.when(
      gapFiller.fillGaps(
        [
          {
            start: [0, 1],
            end: [1, 1],
            segments: [{type: plotter.LINE, start: [0, 1], end: [1, 1]}],
          },
        ],
        0.123
      )
    ).thenReturn([
      [
        {
          type: plotter.IMAGE_REGION,
          segments: [
            {
              type: plotter.LINE,
              start: [1, 1],
              end: [1, 0],
            },
          ],
        },
      ],
      [],
    ])

    td.when(
      plotter.BoundingBox.fromGraphics([
        {
          type: plotter.IMAGE_REGION,
          segments: [
            {
              type: plotter.LINE,
              start: [1, 1],
              end: [1, 0],
            },
          ],
        },
      ])
    ).thenReturn([9, 8, 7, 6])

    const result = subject.plotBoardShape(layers, plotTreesById, 0.123)

    expect(result).to.eql({
      size: [9, 8, 7, 6],
      regions: [
        {
          type: plotter.IMAGE_REGION,
          segments: [{type: plotter.LINE, start: [1, 1], end: [1, 0]}],
        },
      ],
      openPaths: [],
    })
  })
})
