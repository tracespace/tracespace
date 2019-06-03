import React from 'react'
import {CoordinateFormat, ZeroSuppression} from 'gerber-parser'
import {Units} from 'gerber-plotter'
import {ConverterResult} from 'gerber-to-svg'
import {Color} from 'pcb-stackup-core'
import {ViewBox} from 'viewbox'
import {GerberSide, GerberType} from 'whats-that-gerber'

export {CoordinateFormat, ZeroSuppression, Units, GerberType, GerberSide}

export type AppPreferences = Optional<{
  analyticsOptIn: boolean
}>

export type Mode = null | 'top' | 'bottom' | 'layers'

export type SvgSource = string | null

export type Board = {
  id: string
  name: string
  layerIds: Array<string>
  layers: LayersMap
  options: BoardOptions
  gerberOptions: Optional<LayerOptions>
  drillOptions: Optional<LayerOptions>
  thumbnail: string
  sourceUrl?: string
}

export type Layer = {
  id: string
  filename: string
  sourceId: string
  source: Buffer
  side: GerberSide
  type: GerberType
  color: string
  initialOptions: LayerOptions
}

export type LayersMap = {
  [id: string]: Layer
}

export type BoardSummary = Pick<Board, 'id' | 'name' | 'options' | 'thumbnail'>

export type BoardUpdate = Partial<{
  id: Board['id']
  name: Board['name']
  options: Board['options']
  gerberOptions: Board['gerberOptions']
  drillOptions: Board['drillOptions']
  layers: Partial<LayerUpdatesMap>
}>

export type BoardRender = {
  id: string
  name: string
  options: BoardOptions
  gerberOptions: Optional<LayerOptions>
  drillOptions: Optional<LayerOptions>
  viewBox: ViewBox
  top: SvgSource
  bottom: SvgSource
  layers: Array<LayerRender>
  sourceIds: Array<string>
  sourceUrl: string | null
}

export type LayerRender = {
  id: string
  filename: string
  type: GerberType
  side: GerberSide
  converter: ConverterResult
  initialOptions: LayerOptions
  color: string
  scale: number
}

export type BoardOptions = {
  useOutline: boolean
  outlineGapFill: number
  color: Pick<Color, 'sm' | 'ss' | 'cf'>
}

export type LayerOptions = {
  coordinateFormat: CoordinateFormat
  zeroSuppression: ZeroSuppression
  units: Units
}

export type LayerUpdatesMap = {
  [id: string]: {
    side: GerberSide
    type: GerberType
    color: string
  }
}

export type LayerVisibilityMap = {[id: string]: boolean}

export type ErrorObject = {
  name: string
  message: string
  error: string
}

export type FileEvent =
  | React.DragEvent<HTMLElement>
  | React.ChangeEvent<HTMLInputElement>

export type LogLevel = 'debug' | 'info' | 'warn' | 'error'

export type LogHandler = (message: string, ...meta: Array<unknown>) => void

export type Logger = {[Level in LogLevel]: LogHandler}

export type Omit<T, K> = Pick<T, Exclude<keyof T, K>>

export type Optional<T> = {[P in keyof T]?: T[P] | null | undefined}
