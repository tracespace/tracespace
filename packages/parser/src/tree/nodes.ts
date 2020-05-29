import {Node as UnistNode, Parent as UnistParent} from 'unist'

import * as Types from '../types'

// node type constants
export const ROOT = 'root'
export const COMMENT = 'comment'
export const DONE = 'done'
export const UNITS = 'units'
export const COORDINATE_FORMAT = 'coordinateFormat'
export const TOOL_DEFINITION = 'toolDefinition'
export const TOOL_MACRO = 'toolMacro'
export const TOOL_CHANGE = 'toolChange'
export const GRAPHIC = 'graphic'
export const INTERPOLATE_MODE = 'interpolateMode'
export const REGION_MODE = 'regionMode'
export const QUADRANT_MODE = 'quadrantMode'
export const MACRO_COMMENT = 'macroComment'
export const MACRO_VARIABLE = 'macroVariable'
export const MACRO_PRIMITIVE = 'macroPrimitive'

export type Node = Root | ChildNode

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

export type MacroBlock = MacroComment | MacroVariable | MacroPrimitive

export interface Root extends UnistParent {
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
  children: MacroBlock[]
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

// macro blocks may only be children of a ToolMacro

export interface MacroComment extends UnistNode {
  type: typeof MACRO_COMMENT
  comment: string
}

export interface MacroVariable extends UnistNode {
  type: typeof MACRO_VARIABLE
  name: string
  value: Types.MacroValue
}

export interface MacroPrimitive extends UnistNode {
  type: typeof MACRO_PRIMITIVE
  code: Types.MacroPrimitiveCode | string
  modifiers: Types.MacroValue[]
}
