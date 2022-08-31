import type {Node, Parent} from 'unist'

import type {UnitsType} from '@tracespace/parser'

export const IMAGE = 'image'
export const IMAGE_SHAPE = 'imageShape'
export const IMAGE_PATH = 'imagePath'
export const IMAGE_REGION = 'imageRegion'

export const LINE = 'line'
export const ARC = 'arc'

export const CIRCLE = 'circle'
export const RECTANGLE = 'rectangle'
export const POLYGON = 'polygon'
export const OUTLINE = 'outline'
export const LAYERED_SHAPE = 'layeredShape'

export type Position = [x: number, y: number]

export type ArcPosition = [x: number, y: number, theta: number]

export type SizeEnvelope = [x1: number, y1: number, x2: number, y2: number] | []

export type ImageNode = ImageTree | ImageShape | ImagePath | ImageRegion

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
  r?: number
}

export interface PolygonShape {
  type: typeof POLYGON
  points: Position[]
}

export interface OutlineShape {
  type: typeof OUTLINE
  segments: PathSegment[]
}

export interface LayeredShape {
  type: typeof LAYERED_SHAPE
  shapes: ErasableShape[]
}

export type HoleShape = CircleShape | RectangleShape

export type SimpleShape =
  | CircleShape
  | RectangleShape
  | PolygonShape
  | OutlineShape

export type Shape = SimpleShape | LayeredShape

export type ErasableShape = SimpleShape & {erase?: boolean}

export type ImageGraphic = ImageShape | ImagePath | ImageRegion

export interface ImageTree extends Parent {
  type: typeof IMAGE
  units: UnitsType
  size: SizeEnvelope
  children: ImageGraphic[]
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
}

export type PathSegment = PathLineSegment | PathArcSegment

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
}
