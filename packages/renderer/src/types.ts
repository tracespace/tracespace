import {Element as SvgElement} from 'hast-format'
import {Layer, Options} from '@tracespace/plotter'

export {SvgElement}

export interface SvgRender {
  // topRender: SvgElement
  // bottomRender: SvgElement
  layers: SvgLayer[]
}

export interface SvgLayer extends Layer {
  svgRender: SvgElement
}

export interface SvgOptions extends Options {
  colors: Colors
}

export interface Colors {
  copper: string
  mask: string
  silkscreen: string
  paste: string
  substrate: string
}
