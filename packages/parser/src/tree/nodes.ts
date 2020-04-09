import {Node as UnistNode, Parent as UnistParent} from 'unist'

import * as Types from '../types'

export interface Parent extends UnistParent {
  children: Array<UnistNode | UnistParent>
}

// node type constants
export const ROOT = 'root'
export const COMMENT = 'comment'
export const DONE = 'done'
export const HEADER = 'header'
export const IMAGE = 'image'
export const UNITS = 'units'
export const COORDINATE_FORMAT = 'coordinateFormat'
export const TOOL_DEFINITION = 'toolDefinition'
export const TOOL_MACRO = 'toolMacro'
export const TOOL_CHANGE = 'toolChange'
export const GRAPHIC = 'graphic'
export const INTERPOLATE_MODE = 'interpolateMode'
export const REGION_MODE = 'regionMode'
export const QUADRANT_MODE = 'quadrantMode'

export type ChildNode =
  | Comment
  | Done
  | Units
  | CoordinateFormat
  | ToolDefinition
  | ToolMacro
  | ToolChange
  | InterpolateMode
  | RegionMode
  | QuadrantMode
  | Graphic

export type Node = ChildNode | Root

export type NodeType =
  | typeof ROOT
  | typeof COMMENT
  | typeof HEADER
  | typeof IMAGE
  | typeof UNITS
  | typeof COORDINATE_FORMAT
  | typeof TOOL_DEFINITION
  | typeof TOOL_MACRO
  | typeof TOOL_CHANGE
  | typeof INTERPOLATE_MODE
  | typeof REGION_MODE
  | typeof QUADRANT_MODE
  | typeof GRAPHIC

export interface Root extends Parent {
  type: typeof ROOT
  filetype: Types.Filetype | null
  done: boolean
  children: ChildNode[]
}

export interface Comment extends UnistNode {
  type: typeof COMMENT
  comment: string
}

export interface Done extends UnistNode {
  type: typeof DONE
}

export interface Units extends UnistNode {
  type: typeof UNITS
  units: Types.UnitsType
}

export interface CoordinateFormat extends UnistNode {
  type: typeof COORDINATE_FORMAT
  format: Types.Format | null
  zeroSuppression: Types.ZeroSuppression | null
  mode: Types.Mode | null
}

export interface ToolDefinition extends UnistNode {
  type: typeof TOOL_DEFINITION
  code: string
  shape: Types.ToolShape
  hole: Types.HoleShape
}

export interface ToolMacro extends UnistNode {
  type: typeof TOOL_MACRO
  name: string
  blocks: Types.MacroBlock[]
}

export interface ToolChange extends UnistNode {
  type: typeof TOOL_CHANGE
  code: string
}
export interface Graphic extends UnistNode {
  type: typeof GRAPHIC
  graphic: Types.GraphicType
  coordinates: Types.Coordinates
}

export interface InterpolateMode extends UnistNode {
  type: typeof INTERPOLATE_MODE
  mode: Types.InterpolateModeType
}

export interface RegionMode extends UnistNode {
  type: typeof REGION_MODE
  region: boolean
}

export interface QuadrantMode extends UnistNode {
  type: typeof QUADRANT_MODE
  quadrant: Types.QuadrantModeType
}
