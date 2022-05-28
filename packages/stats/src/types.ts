// common types

import {ToolShape} from '@tracespace/parser'

export interface DrillUsage {
  toolShape: ToolShape
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
