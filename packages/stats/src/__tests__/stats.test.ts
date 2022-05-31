import {describe, it, expect} from 'vitest'
import * as Parser from '@tracespace/parser'
import {collectDrillStats, DrillStats} from '..'

describe('@tracespace/stats', () => {
  const emptyStats: DrillStats = {
    drillHits: [],
    drillRoutes: [],
    totalDrills: 0,
    totalRoutes: 0,
    minDrillSize: 0,
    maxDrillSize: 0,
  }

  const tree1: Parser.GerberTree = {
    type: Parser.ROOT,
    filetype: Parser.DRILL,
    children: [
      {
        type: Parser.TOOL_DEFINITION,
        code: '1',
        shape: {
          type: Parser.CIRCLE,
          diameter: 1,
        },
      },
      {
        type: Parser.GRAPHIC,
        graphic: null,
      },
      {
        type: Parser.INTERPOLATE_MODE,
        mode: Parser.DRILL,
      },
      {
        type: Parser.GRAPHIC,
        graphic: null,
      },
      {
        type: Parser.INTERPOLATE_MODE,
        mode: Parser.LINE,
      },
      {
        type: Parser.GRAPHIC,
        graphic: null,
      },
      {
        type: Parser.GRAPHIC,
        graphic: Parser.SLOT,
      },
    ] as Parser.ChildNode[],
  }

  it('should return an empty result', () => {
    expect(collectDrillStats([])).to.eql(emptyStats)
  })

  it('should skip tree', () => {
    const tree: Parser.GerberTree = {
      type: Parser.ROOT,
      filetype: Parser.GERBER,
      children: [],
    }
    expect(collectDrillStats([tree])).to.eql(emptyStats)
  })

  it('should ignore only tool definitions', () => {
    const tree: Parser.GerberTree = {
      type: Parser.ROOT,
      filetype: Parser.DRILL,
      children: [
        {
          type: Parser.TOOL_DEFINITION,
          code: '1',
          shape: {
            type: Parser.CIRCLE,
            diameter: 1,
          },
        },
        {
          type: Parser.TOOL_DEFINITION,
          code: '2',
          shape: {
            type: Parser.RECTANGLE,
            xSize: 1,
            ySize: 1
          },
        },
      ] as Parser.ChildNode[],
    }

    expect(collectDrillStats([tree])).to.eql(emptyStats)
  })

  it('should ignore unset tools', () => {
    const tree: Parser.GerberTree = {
      type: Parser.ROOT,
      filetype: Parser.DRILL,
      children: [
        {
          type: Parser.GRAPHIC,
          graphic: null,
        },
      ] as Parser.ChildNode[],
    }

    expect(collectDrillStats([tree])).to.eql(emptyStats)
  })

  it('should collect drill stats', () => {
    const tree: Parser.GerberTree = {
      type: Parser.ROOT,
      filetype: Parser.DRILL,
      children: [
        {
          type: Parser.TOOL_DEFINITION,
          code: '1',
          shape: {
            type: Parser.CIRCLE,
            diameter: 1,
          },
        },
        {
          type: Parser.GRAPHIC,
          graphic: null,
        },
        {
          type: Parser.INTERPOLATE_MODE,
          mode: Parser.DRILL,
        },
        {
          type: Parser.GRAPHIC,
          graphic: null,
        },
        {
          type: Parser.INTERPOLATE_MODE,
          mode: Parser.LINE,
        },
        {
          type: Parser.GRAPHIC,
          graphic: null,
        },
        {
          type: Parser.GRAPHIC,
          graphic: Parser.SLOT,
        },
      ] as Parser.ChildNode[],
    }

    const expected: DrillStats = {
      drillHits: [
        {count: 2, diameter: 1},
      ],
      drillRoutes: [
        {count: 2, diameter: 1},
      ],
      totalDrills: 2,
      totalRoutes: 2,
      minDrillSize: 1,
      maxDrillSize: 1,
    }

    expect(collectDrillStats([tree1])).to.eql(expected)
  })

  it('should collect drill stats and combine them', () => {
    const tree2: Parser.GerberTree = {
      type: Parser.ROOT,
      filetype: Parser.DRILL,
      children: [
        {
          type: Parser.TOOL_DEFINITION,
          code: '2',
          shape: {
            type: Parser.CIRCLE,
            diameter: 2,
          },
        },
        {
          type: Parser.GRAPHIC,
          graphic: null,
        },
      ] as Parser.ChildNode[],
    }

    const expected: DrillStats = {
      drillHits: [
        {count: 2, diameter: 1},
        {count: 1, diameter: 2},
      ],
      drillRoutes: [
        {count: 2, diameter: 1},
      ],
      totalDrills: 3,
      totalRoutes: 2,
      minDrillSize: 1,
      maxDrillSize: 2,
    }

    expect(collectDrillStats([tree1, tree2])).to.eql(expected)
  })
})
