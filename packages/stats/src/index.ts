import * as Parser from '@tracespace/parser'

export interface DrillUsage {
  diameter: number
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
 * const tree = parser.result()
 * const stats = collectDrillStats([tree])
 * ```
 *
 * @category Stats
 */
export function collectDrillStats(trees: Parser.Root[]): DrillStats {
  const state: DrillStatsState = {
    usedTools: {},
    drillsPerTool: {},
    routesPerTool: {},
    totalDrills: 0,
    totalRoutes: 0,
    minDrillSize: null,
    maxDrillSize: null,
  }

  for (const tree of trees) {
    if (tree.filetype !== Parser.DRILL) {
      continue
    }

    _updateDrillStats(state, tree)
  }

  const hits = Object.entries(state.drillsPerTool).map(([key, count]) => ({
    diameter: state.usedTools[key],
    count,
  }))
  const routes = Object.entries(state.routesPerTool).map(([key, count]) => ({
    diameter: state.usedTools[key],
    count,
  }))

  const stats: DrillStats = {
    drillHits: hits,
    drillRoutes: routes,
    totalDrills: state.totalDrills,
    totalRoutes: state.totalRoutes,
    minDrillSize: state.minDrillSize ?? 0,
    maxDrillSize: state.maxDrillSize ?? 0,
  }

  return stats
}

interface DrillStatsState {
  usedTools: Record<string, number>
  drillsPerTool: Record<string, number>
  routesPerTool: Record<string, number>
  totalDrills: number
  totalRoutes: number
  minDrillSize: number | null
  maxDrillSize: number | null
}

function _updateDrillStats(state: DrillStatsState, tree: Parser.Root) {
  let currentTool = null
  let currentMode: Parser.InterpolateModeType = Parser.DRILL
  for (const node of tree.children) {
    switch (node.type) {
      case Parser.TOOL_DEFINITION:
        currentTool = node.code

        if (node.shape.type === Parser.CIRCLE) {
          state.usedTools[currentTool] = node.shape.diameter
        }

        break
      case Parser.TOOL_CHANGE:
        currentTool = node.code
        break
      case Parser.INTERPOLATE_MODE:
        currentMode = node.mode
        break
      case Parser.GRAPHIC: {
        if (currentTool === null) {
          continue
        }

        if (state.usedTools[currentTool] !== undefined) {
          const diameter = state.usedTools[currentTool]
          state.minDrillSize = Math.min(
            diameter,
            state.minDrillSize ?? Number.POSITIVE_INFINITY
          )
          state.maxDrillSize = Math.max(
            diameter,
            state.maxDrillSize ?? Number.NEGATIVE_INFINITY
          )
        }

        if (node.graphic === null) {
          switch (currentMode) {
            case Parser.DRILL: {
              state.totalDrills++
              const drillCount = state.drillsPerTool[currentTool] ?? 0
              state.drillsPerTool[currentTool] = drillCount + 1
              break
            }

            case Parser.LINE:
            case Parser.CW_ARC:
            case Parser.CCW_ARC: {
              state.totalRoutes++
              const routeCount = state.routesPerTool[currentTool] ?? 0
              state.routesPerTool[currentTool] = routeCount + 1
              break
            }

            default:
              break
          }
        } else if (node.graphic === Parser.SLOT) {
          state.totalRoutes++
          const routeCount = state.routesPerTool[currentTool] ?? 0
          state.routesPerTool[currentTool] = routeCount + 1
        }

        break
      }

      default:
        break
    }
  }
}
