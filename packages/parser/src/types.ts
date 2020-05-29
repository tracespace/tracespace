// common types

import * as Constants from './constants'

export type Filetype = typeof Constants.GERBER | typeof Constants.DRILL

// formatting options

export type UnitsType = typeof Constants.MM | typeof Constants.IN

export type Format = [number, number]

export type ZeroSuppression =
  | typeof Constants.LEADING
  | typeof Constants.TRAILING

export type Mode = typeof Constants.ABSOLUTE | typeof Constants.INCREMENTAL

// shape types

export type ToolShape = Circle | Rectangle | Obround | Polygon | MacroShape

export type HoleShape = Circle | Rectangle | null

export interface Circle {
  type: typeof Constants.CIRCLE
  diameter: number
}

export interface Rectangle {
  type: typeof Constants.RECTANGLE
  xSize: number
  ySize: number
}

export interface Obround {
  type: typeof Constants.OBROUND
  xSize: number
  ySize: number
}

export interface Polygon {
  type: typeof Constants.POLYGON
  diameter: number
  vertices: number
  rotation: number | null
}

export interface MacroShape {
  type: typeof Constants.MACRO_SHAPE
  name: string
  params: number[]
}

// macro shape and expression types

export type MacroPrimitiveCode =
  | typeof Constants.MACRO_CIRCLE
  | typeof Constants.MACRO_VECTOR_LINE
  | typeof Constants.MACRO_CENTER_LINE
  | typeof Constants.MACRO_OUTLINE
  | typeof Constants.MACRO_POLYGON
  | typeof Constants.MACRO_MOIRE
  | typeof Constants.MACRO_THERMAL

export interface MacroExpression {
  left: MacroValue
  right: MacroValue
  operator: '+' | '-' | 'x' | '/'
}

export type MacroValue = number | string | MacroExpression

// graphic drawing types

export type Coordinates = Partial<{[axis: string]: string}>

export type GraphicType =
  | typeof Constants.SHAPE
  | typeof Constants.MOVE
  | typeof Constants.SEGMENT
  | typeof Constants.SLOT
  | null

export type InterpolateModeType =
  | typeof Constants.LINE
  | typeof Constants.CW_ARC
  | typeof Constants.CCW_ARC
  | typeof Constants.MOVE
  | typeof Constants.DRILL
  | null

export type QuadrantModeType =
  | typeof Constants.SINGLE
  | typeof Constants.MULTI
  | null
