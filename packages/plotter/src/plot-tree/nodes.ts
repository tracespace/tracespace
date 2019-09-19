import {Node, Parent} from 'unist'
import {Position, ArcPosition, Box} from '../types'

export const IMAGE = 'image'
export const IMAGE_LAYER = 'imageLayer'
export const IMAGE_SHAPE = 'imageShape'
export const IMAGE_PATH = 'imagePath'
export const IMAGE_REGION = 'imageRegion'

export const DRAW = 'draw'
export const CLEAR = 'clear'
export const LINE = 'line'
export const ARC = 'arc'
export const CW = 'cw'
export const CCW = 'ccw'

export const CIRCLE = 'circle'
export const RECTANGLE = 'rectangle'
export const POLYGON = 'polygon'
export const OUTLINE = 'outline'
export const CLEAR_OUTLINE = 'clearOutline'
export const LAYERED_SHAPE = 'layeredShape'

export type Direction = typeof CW | typeof CCW

export type ImageNode =
  | ImageTree
  | ImageLayer
  | ImageShape
  | ImagePath
  | ImageRegion

export interface CircleShape {
  type: typeof CIRCLE
  cx: number
  cy: number
  r: number
}

export interface RectangleShape {
  type: typeof RECTANGLE
  x: number
  y: number
  xSize: number
  ySize: number
  r: number | null
}

export interface PolygonShape {
  type: typeof POLYGON
  points: Position[]
}

export interface OutlineShape {
  type: typeof OUTLINE
  segments: PathSegment[]
}

export interface ClearOutlineShape {
  type: typeof CLEAR_OUTLINE
  segments: PathSegment[]
}

export interface LayeredShape {
  type: typeof LAYERED_SHAPE
  shapes: (Shape | ClearOutlineShape)[]
}

export type HoleShape = CircleShape | RectangleShape | null

export type SimpleShape =
  | CircleShape
  | RectangleShape
  | PolygonShape
  | OutlineShape
  | ClearOutlineShape

export type Shape = SimpleShape | LayeredShape

export interface ImageTree extends Parent {
  type: typeof IMAGE
  children: [ImageLayer]
}

export interface ImageLayer extends Parent {
  type: typeof IMAGE_LAYER
  size: Box
  polarity?: Polarity
  repeat?: [number, number, number, number]
  children: (ImageLayer | ImageShape | ImagePath | ImageRegion)[]
}

export interface ImageShape extends Node {
  type: typeof IMAGE_SHAPE
  shape: Shape
}

export interface ImagePath extends Node {
  type: typeof IMAGE_PATH
  width: number
  segments: PathSegment[]
}

export interface ImageRegion extends Node {
  type: typeof IMAGE_REGION
  segments: PathSegment[]
  meta: {regionMode: boolean}
}

export type Polarity = typeof DRAW | typeof CLEAR

export type PathSegment = PathLineSegment | PathArcSegment

export type ArcDirection = typeof CW | typeof CCW

export interface PathLineSegment {
  type: typeof LINE
  start: Position
  end: Position
}

export interface PathArcSegment {
  type: typeof ARC
  start: ArcPosition
  end: ArcPosition
  center: Position
  radius: number
  sweep: number
  direction: ArcDirection
}
