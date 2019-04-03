import {Node as UnistNode, Parent as UnistParent} from 'unist'

export interface Parent extends UnistParent {
  children: Array<Node | UnistParent>
}

export type Node = UnistNode

// node type constants
export const ROOT = 'root'
export const HEADER = 'header'
export const IMAGE = 'image'
export const UNITS = 'units'
export const COORDINATE_FORMAT = 'coordinateFormat'
export const TOOL_DEFINITION = 'toolDefinition'
export const TOOL = 'tool'
export const GRAPHIC = 'graphic'

export type NodeType =
  | typeof ROOT
  | typeof HEADER
  | typeof IMAGE
  | typeof UNITS
  | typeof COORDINATE_FORMAT
  | typeof TOOL_DEFINITION
  | typeof TOOL
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
export type ToolShape = Circle | Rectangle | Obround | Polygon
export type HoleShape = Circle | Rectangle

// drawing constants
export const SHAPE = 'shape'
export const MOVE = 'move'
export const SEGMENT = 'segment'
export type GraphicType = typeof SHAPE | typeof MOVE | typeof SEGMENT
export type Coordinates = {[axis: string]: string}

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

// node types
export interface Root extends Parent {
  type: typeof ROOT
  filetype: Filetype | null
  done: boolean
  children: [Header, Image]
}

export interface Header extends Parent {
  type: typeof HEADER
  children: Array<Units | CoordinateFormat | ToolDefinition>
}

export interface Image extends Parent {
  type: typeof IMAGE
}

export interface Units extends Node {
  type: typeof UNITS
  units: UnitsType
}

export interface CoordinateFormat extends Node {
  type: typeof COORDINATE_FORMAT
  format: Format | null
  zeroSuppression: ZeroSuppression | null
  mode: Mode | null
}

export interface ToolDefinition extends Node {
  type: typeof TOOL_DEFINITION
  code: string
  shape: ToolShape
  hole: HoleShape | null
}

export interface Tool extends Parent {
  type: typeof TOOL
  code: string
}

export interface Graphic extends Node {
  type: typeof GRAPHIC
  graphic: GraphicType | null
  coordinates: Coordinates
}
