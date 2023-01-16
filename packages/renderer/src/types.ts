export type {Element as SvgElement} from 'hast'

export interface SvgOptions {
  colors: Colors
}

export interface Colors {
  copper: string
  mask: string
  silkscreen: string
  paste: string
  substrate: string
}

export type ViewBox = [x: number, y: number, width: number, height: number]
