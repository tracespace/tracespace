import * as Parser from '@tracespace/parser'
import {DrillUsage, DrillStats} from './types'

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
  let toolsMap = new Map<string, Parser.ToolShape>()
  let drillsPerTool = new Map<string, number>()
  let routesPerTool = new Map<string, number>()
  let minDrillSize: number = null
  let maxDrillSize: number = null

  for (const tree of trees) {
    if (tree.filetype !== Parser.DRILL) {
      continue
    }

    let currentTool = ''
    let currentMode: Parser.InterpolateModeType = null
    for (const node of tree.children) {
      if (node.type === Parser.TOOL_DEFINITION) {
        currentTool = node.code

        toolsMap.set(currentTool, node.shape)

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
        if (currentTool === '' || currentMode === null) {
          continue
        }

        switch (currentMode) {
          case Parser.DRILL:
            const drillCount = drillsPerTool.get(currentTool) ?? 0
            drillsPerTool.set(currentTool, drillCount + 1)
            break
          case Parser.LINE:
          case Parser.CW_ARC:
          case Parser.CCW_ARC:
            const routeCount = routesPerTool.get(currentTool) ?? 0
            routesPerTool.set(currentTool, routeCount + 1)
            break
        }
      }
    }
  }

  let totalDrills = 0
  const drillHits: DrillUsage[] = []
  drillsPerTool.forEach((count: number, key: string) => {
    totalDrills += count
    drillHits.push({
      toolShape: toolsMap.get(key),
      count: count,
    })
  })

  let totalRoutes = 0
  const drillRoutes: DrillUsage[] = []
  routesPerTool.forEach((count: number, key: string) => {
    totalRoutes += count
    drillRoutes.push({
      toolShape: toolsMap.get(key),
      count: count,
    })
  })

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
