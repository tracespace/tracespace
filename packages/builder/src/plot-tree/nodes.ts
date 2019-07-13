import {Node, Parent} from 'unist'
import * as Parser from '@tracespace/parser'

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

export type Position = [number, number]

export type BoundingBox = [number, number, number, number]

export type ImageNode =
  | ImageTree
  | ImageLayer
  | ImageShape
  | ImagePath
  | ImageRegion

export interface ImageTree extends Parent {
  type: typeof IMAGE
  children: [ImageLayer]
}

export interface ImageLayer extends Parent {
  type: typeof IMAGE_LAYER
  size: BoundingBox
  polarity?: Polarity
  repeat?: [number, number, number, number]
  children: (ImageLayer | ImageShape | ImagePath | ImageRegion)[]
}

export interface ImageShape extends Node {
  type: typeof IMAGE_SHAPE
  x: number
  y: number
  // TODO(mc, 2019-06-10): support holes and macros
  shape: Parser.ToolShape
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

export type Polarity = typeof DRAW | typeof CLEAR

export type PathSegment = PathLineSegment | PathArcSegment

export interface PathLineSegment {
  type: typeof LINE
  // x, y
  start: Position
  end: Position
}

export interface PathArcSegment {
  type: typeof ARC
  // x, y
  center: Position
  radius: number
  sweep: number
  direction: typeof CW | typeof CCW
  // x, y, theta
  start: [number, number, number]
  end: [number, number, number]
}
