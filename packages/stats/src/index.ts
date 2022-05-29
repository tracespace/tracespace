import * as Parser from '@tracespace/parser'

export interface DrillUsage {
  toolShape: Parser.ToolShape
  count: number
}

export interface DrillStats {
  drillHits: DrillUsage[]
  drillRoutes: DrillUsage[]
  totalDrills: number
  totalRoutes: number
  minDrillSize: number
  maxDrillSize: number
}

/**
 * Method to collect drill stats of parsed drill files.
 *
 * @example
 * ```ts
 * import {createParser} from '@tracespace/parser'
 * import {collectDrillStats} from '@tracespace/stats'
 *
 * const parser = createParser()
 *
 * parser.feed(...)
 *
 * const tree = parser.results()
 * const stats = collectDrillStats([tree])
 * ```
 *
 * @category Stats
 */
export function collectDrillStats(trees: Parser.Root[]): DrillStats {
  const toolsMap: Record<string, Parser.ToolShape> = {}
  const drillsPerTool: Record<string, number> = {}
  const routesPerTool: Record<string, number> = {}
  let minDrillSize: number | null = null
  let maxDrillSize: number | null = null

  for (const tree of trees) {
    if (tree.filetype !== Parser.DRILL) {
      continue
    }

    let currentTool = null
    let currentMode: Parser.InterpolateModeType = null
    for (const node of tree.children) {
      if (node.type === Parser.TOOL_DEFINITION) {
        currentTool = node.code

        toolsMap[currentTool] = node.shape

        if (node.shape.type === Parser.CIRCLE) {
          const diameter = node.shape.diameter
          if (minDrillSize === null || diameter < minDrillSize) {
            minDrillSize = diameter
          }
          if (maxDrillSize === null || diameter > maxDrillSize) {
            maxDrillSize = diameter
          }
        }
      } else if (node.type === Parser.TOOL_CHANGE) {
        currentTool = node.code
      } else if (node.type === Parser.INTERPOLATE_MODE) {
        currentMode = node.mode
      } else if (node.type === Parser.GRAPHIC) {
        if (node.graphic !== null) {
          continue
        }
        if (currentTool === null || currentMode === null) {
          continue
        }

        switch (currentMode) {
          case Parser.DRILL:
            const drillCount = drillsPerTool[currentTool] ?? 0
            drillsPerTool[currentTool] = drillCount + 1
            break
          case Parser.LINE:
          case Parser.CW_ARC:
          case Parser.CCW_ARC:
            const routeCount = routesPerTool[currentTool] ?? 0
            routesPerTool[currentTool] = routeCount + 1
            break
        }
      }
    }
  }

  let totalDrills = 0
  const drillHits: DrillUsage[] = []
  for (const key in drillsPerTool) {
    const count = drillsPerTool[key]
    totalDrills += count
    drillHits.push({
      toolShape: toolsMap[key],
      count: count,
    })
  }

  let totalRoutes = 0
  const drillRoutes: DrillUsage[] = []
  for (const key in routesPerTool) {
    const count = routesPerTool[key]
    totalRoutes += count
    drillRoutes.push({
      toolShape: toolsMap[key],
      count: count,
    })
  }

  const stats: DrillStats = {
    drillHits: drillHits,
    drillRoutes: drillRoutes,
    totalDrills: totalDrills,
    totalRoutes: totalRoutes,
    minDrillSize: minDrillSize ?? 0,
    maxDrillSize: maxDrillSize ?? 0,
  }

  return stats
}
