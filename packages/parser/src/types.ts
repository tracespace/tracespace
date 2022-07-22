// Common types

import type * as Constants from './constants'

/**
 * Gerber file or NC drill file
 */
export type Filetype = typeof Constants.GERBER | typeof Constants.DRILL

/**
 * Millimeters or inches
 */
export type UnitsType = typeof Constants.MM | typeof Constants.IN

/**
 * Coordinate string decimal format, where Format[0] represents the maximum
 * number of integer digits in the string and Format[1] represents the number
 * of decimal digits. The decimal point itself is usually implicit.
 */
export type Format = [integerPlaces: number, decimalPlaces: number]

/**
 * Leading or trailing zero-suppression for coordinate strings
 */
export type ZeroSuppression =
  | typeof Constants.LEADING
  | typeof Constants.TRAILING

/**
 * Absolute or incremental coordinates
 */
export type Mode = typeof Constants.ABSOLUTE | typeof Constants.INCREMENTAL

/**
 * Union type of valid tool shapes
 *
 * @category Shape
 */
export type ToolShape = Circle | Rectangle | Obround | Polygon | MacroShape

/**
 * Union type of non-macro tool shapes
 *
 * @category Shape
 */
export type SimpleShape = Circle | Rectangle | Obround | Polygon

/**
 * Union type of valid tool hole shapes
 *
 * @category Shape
 */
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
 * A regular polygon with a circumscribed circle diameter, number of vertices,
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
  variableValues: number[]
}

/**
 * Union type of macro primitive shape identifiers
 *
 * @category Macro
 */
export type MacroPrimitiveCode =
  | typeof Constants.MACRO_CIRCLE
  | typeof Constants.MACRO_VECTOR_LINE_DEPRECATED
  | typeof Constants.MACRO_VECTOR_LINE
  | typeof Constants.MACRO_CENTER_LINE
  | typeof Constants.MACRO_LOWER_LEFT_LINE_DEPRECATED
  | typeof Constants.MACRO_OUTLINE
  | typeof Constants.MACRO_POLYGON
  | typeof Constants.MACRO_MOIRE_DEPRECATED
  | typeof Constants.MACRO_THERMAL

/**
 * An arithmetic expression in a macro
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

/**
 * A map of axes to coordinate strings used to define the location of a
 * graphical operation
 */
export type Coordinates = Partial<Record<string, string>>

/**
 * Parameters of a step repeat
 */
export type StepRepeatParameters = Record<string, number>

/**
 * Valid graphical operation types
 */
export type GraphicType =
  | typeof Constants.SHAPE
  | typeof Constants.MOVE
  | typeof Constants.SEGMENT
  | typeof Constants.SLOT
  | null

/**
 * Valid interpolations modes
 */
export type InterpolateModeType =
  | typeof Constants.LINE
  | typeof Constants.CW_ARC
  | typeof Constants.CCW_ARC
  | typeof Constants.MOVE
  | typeof Constants.DRILL
  | null

/**
 * Valid quadrant modes
 */
export type QuadrantModeType =
  | typeof Constants.SINGLE
  | typeof Constants.MULTI
  | null

/**
 * Valid image polarities
 */
export type Polarity = typeof Constants.DARK | typeof Constants.CLEAR
