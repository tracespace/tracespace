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
 * const tree = parser.results()
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
    minDrillSize: null,
    maxDrillSize: null,
  }

  for (const tree of trees) {
    if (tree.filetype !== Parser.DRILL) {
      continue
    }

    _updateDrillStats(state, tree)
  }

  let totalDrills = 0
  const drillHits: DrillUsage[] = []
  for (const [key, count] of Object.entries(state.drillsPerTool)) {
    totalDrills += count
    drillHits.push({
      diameter: state.usedTools[key],
      count,
    })
  }

  let totalRoutes = 0
  const drillRoutes: DrillUsage[] = []
  for (const [key, count] of Object.entries(state.routesPerTool)) {
    totalRoutes += count
    drillRoutes.push({
      diameter: state.usedTools[key],
      count,
    })
  }

  const stats: DrillStats = {
    drillHits,
    drillRoutes,
    totalDrills,
    totalRoutes,
    minDrillSize: state.minDrillSize ?? 0,
    maxDrillSize: state.maxDrillSize ?? 0,
  }

  return stats
}

interface DrillStatsState {
  usedTools: Record<string, number>
  drillsPerTool: Record<string, number>
  routesPerTool: Record<string, number>
  minDrillSize: number | null
  maxDrillSize: number | null
}

function _updateDrillStats(state: DrillStatsState, tree: Parser.Root) {
  let currentTool = null
  let currentMode: Parser.InterpolateModeType = Parser.DRILL
  for (const node of tree.children) {
    switch (node.type) {
      case Parser.TOOL_DEFINITION: {
        currentTool = node.code

        if (node.shape.type !== Parser.CIRCLE) {
          continue
        }

        const {diameter} = node.shape

        state.usedTools[currentTool] = diameter

        if (state.minDrillSize === null || diameter < state.minDrillSize) {
          state.minDrillSize = diameter
        }

        if (state.maxDrillSize === null || diameter > state.maxDrillSize) {
          state.maxDrillSize = diameter
        }

        break
      }

      case Parser.TOOL_CHANGE:
        currentTool = node.code
        break
      case Parser.INTERPOLATE_MODE:
        currentMode = node.mode
        break
      case Parser.GRAPHIC:
        if (currentTool === null) {
          continue
        }

        if (node.graphic === null) {
          switch (currentMode) {
            case Parser.DRILL: {
              const drillCount = state.drillsPerTool[currentTool] ?? 0
              state.drillsPerTool[currentTool] = drillCount + 1
              break
            }

            case Parser.LINE:
            case Parser.CW_ARC:
            case Parser.CCW_ARC: {
              const routeCount = state.routesPerTool[currentTool] ?? 0
              state.routesPerTool[currentTool] = routeCount + 1
              break
            }

            default:
              break
          }
        } else if (node.graphic === Parser.SLOT) {
          const routeCount = state.routesPerTool[currentTool] ?? 0
          state.routesPerTool[currentTool] = routeCount + 1
        }

        break
      default:
        break
    }
  }
}
