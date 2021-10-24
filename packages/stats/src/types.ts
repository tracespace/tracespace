// common types

import {ToolShape} from '@tracespace/parser'

export interface Stats {
  tools: Map<string, ToolShape>
  drillsPerTool: Map<string, number>
  totalDrills: number
  minDrillSize: number
  maxDrillSize: number
}
