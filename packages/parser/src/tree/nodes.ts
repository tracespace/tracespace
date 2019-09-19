import {Node as UnistNode, Parent as UnistParent} from 'unist'

export interface Parent extends UnistParent {
  children: Array<UnistNode | UnistParent>
}

// node type constants
export const ROOT = 'root'
export const COMMENT = 'comment'
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

export type Node =
  | Root
  | Comment
  | Header
  | Image
  | Units
  | CoordinateFormat
  | ToolDefinition
  | ToolMacro
  | ToolChange
  | InterpolateMode
  | RegionMode
  | QuadrantMode
  | Graphic

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

// file type constants
export const GERBER = 'gerber'
export const DRILL = 'drill'
export type Filetype = typeof GERBER | typeof DRILL

// units constants
export const MM = 'mm'
export const IN = 'in'
export type UnitsType = typeof MM | typeof IN

// format constants
export const LEADING = 'leading'
export const TRAILING = 'trailing'
export const ABSOLUTE = 'absolute'
export const INCREMENTAL = 'incremental'
export type Format = [number, number]
export type ZeroSuppression = typeof LEADING | typeof TRAILING
export type Mode = typeof ABSOLUTE | typeof INCREMENTAL

// tool constants
export const CIRCLE = 'circle'
export const RECTANGLE = 'rectangle'
export const OBROUND = 'obround'
export const POLYGON = 'polygon'
export const MACRO_SHAPE = 'macroShape'
export type ToolShape = Circle | Rectangle | Obround | Polygon | MacroShape
export type HoleShape = Circle | Rectangle | null

// macro constants
export const MACRO_COMMENT = 'macroComment'
export const MACRO_VARIABLE = 'macroVariable'
export const MACRO_PRIMITIVE = 'macroPrimitive'

export const MACRO_CIRCLE = '1'
export const MACRO_VECTOR_LINE = '20'
export const MACRO_CENTER_LINE = '21'
export const MACRO_OUTLINE = '4'
export const MACRO_POLYGON = '5'
export const MACRO_MOIRE = '6'
export const MACRO_THERMAL = '7'

export type MacroPrimitiveCode =
  | typeof MACRO_CIRCLE
  | typeof MACRO_VECTOR_LINE
  | typeof MACRO_CENTER_LINE
  | typeof MACRO_OUTLINE
  | typeof MACRO_POLYGON
  | typeof MACRO_MOIRE
  | typeof MACRO_THERMAL

// drawing constants
export const SHAPE = 'shape'
export const MOVE = 'move'
export const SEGMENT = 'segment'
export const SLOT = 'slot'

// interpolation / routing constants
export const LINE = 'line'
export const CW_ARC = 'cwArc'
export const CCW_ARC = 'ccwArc'

// quadrant mode
export const SINGLE = 'single'
export const MULTI = 'multi'

export type GraphicType =
  | typeof SHAPE
  | typeof MOVE
  | typeof SEGMENT
  | typeof SLOT
  | null

export type InterpolateModeType =
  | typeof LINE
  | typeof CW_ARC
  | typeof CCW_ARC
  | typeof MOVE
  | null

export type QuadrantModeType = typeof SINGLE | typeof MULTI | null

export type Coordinates = Partial<{[axis: string]: string}>
export interface Circle {
  type: typeof CIRCLE
  diameter: number
}

export interface Rectangle {
  type: typeof RECTANGLE
  xSize: number
  ySize: number
}

export interface Obround {
  type: typeof OBROUND
  xSize: number
  ySize: number
}

export interface Polygon {
  type: typeof POLYGON
  diameter: number
  vertices: number
  rotation: number | null
}

export interface MacroShape {
  type: typeof MACRO_SHAPE
  name: string
  params: number[]
}

export interface MacroExpression {
  left: MacroValue
  right: MacroValue
  operator: '+' | '-' | 'x' | '/'
}

export type MacroValue = number | string | MacroExpression

export type MacroBlock = MacroComment | MacroVariable | MacroPrimitive

export interface MacroComment {
  type: typeof MACRO_COMMENT
  value: string
}

export interface MacroVariable {
  type: typeof MACRO_VARIABLE
  name: string
  value: MacroValue
}

export interface MacroPrimitive {
  type: typeof MACRO_PRIMITIVE
  code: MacroPrimitiveCode | string
  modifiers: MacroValue[]
}

// node types
export type Ancestor = Root | Header | Image

export type HeaderChild =
  | Comment
  | Units
  | CoordinateFormat
  | ToolDefinition
  | ToolMacro

export type ImageChild =
  | Comment
  | ToolChange
  | InterpolateMode
  | RegionMode
  | QuadrantMode
  | Graphic

export interface Root extends Parent {
  type: typeof ROOT
  filetype: Filetype | null
  done: boolean
  children: [Header, Image]
}

export interface Comment extends UnistNode {
  type: typeof COMMENT
  value: string
}

export interface Header extends Parent {
  type: typeof HEADER
  children: HeaderChild[]
}

export interface Image extends Parent {
  type: typeof IMAGE
  children: ImageChild[]
}

export interface Units extends UnistNode {
  type: typeof UNITS
  units: UnitsType
}

export interface CoordinateFormat extends UnistNode {
  type: typeof COORDINATE_FORMAT
  format: Format | null
  zeroSuppression: ZeroSuppression | null
  mode: Mode | null
}

export interface ToolDefinition extends UnistNode {
  type: typeof TOOL_DEFINITION
  code: string
  shape: ToolShape
  hole: HoleShape
}

export interface ToolMacro extends UnistNode {
  type: typeof TOOL_MACRO
  name: string
  blocks: MacroBlock[]
}

export interface ToolChange extends UnistNode {
  type: typeof TOOL_CHANGE
  code: string
}
export interface Graphic extends UnistNode {
  type: typeof GRAPHIC
  graphic: GraphicType
  coordinates: Coordinates
}

export interface InterpolateMode extends UnistNode {
  type: typeof INTERPOLATE_MODE
  mode: InterpolateModeType
}

export interface RegionMode extends UnistNode {
  type: typeof REGION_MODE
  region: boolean
}

export interface QuadrantMode extends UnistNode {
  type: typeof QUADRANT_MODE
  quadrant: QuadrantModeType
}
