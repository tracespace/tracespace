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

export type HoleShape = Circle | Rectangle

/**
 * A centered circle with a given diameter.
 *
 * @category Shape
 */
export interface Circle {
  type: typeof Constants.CIRCLE
  diameter: number
}

/**
 * A centered rectangle with given side lengths in the x and y axes.
 *
 * @category Shape
 */
export interface Rectangle {
  type: typeof Constants.RECTANGLE
  xSize: number
  ySize: number
}

/**
 * A variant of a rectangle with rounded corners. The shape's border radius is
 * equal to half of the length of the shorter sides, making a pill shape.
 *
 * @category Shape
 */
export interface Obround {
  type: typeof Constants.OBROUND
  xSize: number
  ySize: number
}

/**
 * A regular polygon with a circumscribed circle diamter, number of vertices,
 * and optional counter-clockwise rotation in degrees. If `rotation` is
 * unspecified or `0`, a point will lie on the positive x axis.
 *
 * @category Shape
 */
export interface Polygon {
  type: typeof Constants.POLYGON
  diameter: number
  vertices: number
  rotation: number | null
}

/**
 * A shape defined by the {@linkcode ToolMacro} with `name`.
 *
 * @category Shape
 */
export interface MacroShape {
  type: typeof Constants.MACRO_SHAPE
  name: string
  params: number[]
}

// macro shape and expression types

/**
 * Union type of macro primitive shape identifiers
 *
 * @category Macro
 */
export type MacroPrimitiveCode =
  | typeof Constants.MACRO_CIRCLE
  | typeof Constants.MACRO_VECTOR_LINE
  | typeof Constants.MACRO_CENTER_LINE
  | typeof Constants.MACRO_OUTLINE
  | typeof Constants.MACRO_POLYGON
  | typeof Constants.MACRO_MOIRE
  | typeof Constants.MACRO_THERMAL

/**
 * An arithmatic expression in a macro
 *
 * @category Macro
 */
export interface MacroExpression {
  left: MacroValue
  right: MacroValue
  operator: '+' | '-' | 'x' | '/'
}

/**
 * A value in a macro. The number may be a literal number, a string
 * representing a variable in the macro, or an arithmetic expression.
 *
 * @category Macro
 */
export type MacroValue = number | string | MacroExpression

// graphic drawing types

export type Coordinates = { [axis: string]: string }

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
