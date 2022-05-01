import * as Parser from '@tracespace/parser'
import {GerberSide, GerberType} from 'whats-that-gerber'

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

export interface Options {
  units: Units
}

export type ToolMap = Record<string, Parser.ToolDefinition>

export type MacroMap = Record<string, Parser.ToolMacro>

export type Position = [x: number, y: number]

export type ArcPosition = [x: number, y: number, theta: number]

export type Box = [x1: number, y1: number, x2: number, y2: number]

export type Offsets = {i: number | null; j: number | null; a: number | null}
