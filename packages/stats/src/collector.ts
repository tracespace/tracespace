import * as Parser from '@tracespace/parser'
import {Stats} from './types'

/**
 * Method to collect stats of a parsed drill file.
 *
 * @example
 * ```ts
 * import {createParser} from '@tracespace/parser'
 * import {collectStats} from '@tracespace/stats'
 *
 * const parser = createParser()
 *
 * parser.feed(...)
 *
 * const tree = parser.results()
 * const stats = collectStats(tree)
 * ```
 *
 * @category Stats
 */
export function collectStats(root: Parser.Root): Stats {
  const stats: Stats = {
    tools: new Map<string, Parser.ToolShape>(),
    drillsPerTool: new Map<string, number>(),
    totalDrills: 0,
    minDrillSize: 999999,
    maxDrillSize: 0,
  }

  let currentTool = ''
  for (const node of root.children) {
    if (node.type === Parser.TOOL_DEFINITION) {
      stats.tools.set(node.code, node.shape)

      if (node.shape.type === Parser.CIRCLE) {
        const diameter = node.shape.diameter
        if (diameter < stats.minDrillSize) {
          stats.minDrillSize = diameter
        }
        if (diameter > stats.maxDrillSize) {
          stats.maxDrillSize = diameter
        }
      }
    } else if (node.type === Parser.TOOL_CHANGE) {
      currentTool = node.code
    } else if (node.type === Parser.INTERPOLATE_MODE) {
      if (currentTool === '') {
        throw new Error('no tool selected')
      }
      const oldCount = stats.drillsPerTool.get(currentTool) ?? 0
      stats.drillsPerTool.set(currentTool, oldCount + 1)

      stats.totalDrills++
    }
  }

  return stats
}
