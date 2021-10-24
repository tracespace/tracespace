import {Root, ToolShape, ToolDefinition, Circle, ToolChange, InterpolateMode} from '@tracespace/parser'
import {Stats} from './types'

/**
 * Board stats collector.
 *
 * @category StatsCollector
 */
export interface StatsCollector {
  /** Collect stats of a parsed AST */
  collect(root: Root): Stats
}

/**
 * {@linkcode StatsCollector} factory and the primary export of the library.
 *
 * @example
 * ```ts
 * import {createParser} from '@tracespace/parser'
 * import {createStatsCollector} from '@tracespace/stats'
 *
 * const parser = createParser()
 * const statsCollector = createStatsCollector()
 *
 * parser.feed(...)
 *
 * const tree = parser.results()
 * const stats = statsCollector.collect(tree)
 * ```
 *
 * @category StatsCollector
 */
export function createStatsCollector(): StatsCollector {
  return {collect}

  function collect(root: Root): Stats {
    const stats: Stats = {
      tools: new Map<string, ToolShape>(),
      drillsPerTool: new Map<string, number>(),
      totalDrills: 0,
      minDrillSize: 999999,
      maxDrillSize: 0,
    }

    let currentTool = ''
    for (let node of root.children) {
      if (node instanceof ToolDefinition) {
        stats.tools.set(node.code, node.shape)

        if (node.shape instanceof Circle) {
          const diameter = node.shape.diameter
          if (diameter < stats.minDrillSize) {
            stats.minDrillSize = diameter
          }
          if (diameter > stats.maxDrillSize) {
            stats.maxDrillSize = diameter
          }
        }
      } else if (node instanceof ToolChange) {
        currentTool = node.code
      } else if (node instanceof InterpolateMode) {
        if (currentTool == '') {
          throw new Error('no tool selected')
        }
        const oldCount = stats.drillsPerTool.get(currentTool) ?? 0
        stats.drillsPerTool.set(currentTool, oldCount + 1)

        stats.totalDrills++
      }
    }

    return stats
  }
}
