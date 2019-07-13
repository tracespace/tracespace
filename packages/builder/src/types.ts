import {GerberType, GerberSide} from 'whats-that-gerber'
import * as Parser from '@tracespace/parser'
import {ImageTree} from './plot-tree'

export type Units = Parser.UnitsType

export type GerberTree = Parser.Root

export interface InputLayer {
  filename?: string
  type?: GerberType
  side?: GerberSide
  units?: Parser.UnitsType
  coordMode?: Parser.Mode
  coordFormat?: Parser.Format
  zeroSuppression?: Parser.ZeroSuppression
  tree: Parser.Root
}

export interface InputOptions {
  units?: Units
}

export interface LayerType {
  type: GerberType
  side: GerberSide
}

export interface LayerFormat {
  filetype: Parser.Filetype
  units: Parser.UnitsType
  coordMode: Parser.Mode
  coordFormat: Parser.Format
  zeroSuppression: Parser.ZeroSuppression
}

export interface Layer extends LayerType, LayerFormat {
  filename: string | null
  tree: Parser.Root
  image: ImageTree
}

export interface Options {
  units: Units
}

export interface Board {
  layers: Layer[]
  options: Options
}

export interface ToolMap {
  [code: string]: Parser.ToolDefinition
}
