import type * as Constants from './constants'

export type LayerIdentityMap = Record<string, LayerIdentity>

export interface LayerIdentity {
  type: GerberType
  side: GerberSide
}

export interface ValidLayer {
  type: NonNullable<GerberType>
  side: GerberSide
}

export type ValidatedLayer = LayerIdentity & {valid: boolean}

export type GerberType =
  | typeof Constants.TYPE_COPPER
  | typeof Constants.TYPE_SOLDERMASK
  | typeof Constants.TYPE_SILKSCREEN
  | typeof Constants.TYPE_SOLDERPASTE
  | typeof Constants.TYPE_DRILL
  | typeof Constants.TYPE_OUTLINE
  | typeof Constants.TYPE_DRAWING
  | null

export type GerberSide =
  | typeof Constants.SIDE_TOP
  | typeof Constants.SIDE_BOTTOM
  | typeof Constants.SIDE_INNER
  | typeof Constants.SIDE_ALL
  | null

export type GerberCad =
  | typeof Constants.CAD_KICAD
  | typeof Constants.CAD_ALTIUM
  | typeof Constants.CAD_ALLEGRO
  | typeof Constants.CAD_EAGLE
  | typeof Constants.CAD_EAGLE_LEGACY
  | typeof Constants.CAD_EAGLE_OSHPARK
  | typeof Constants.CAD_EAGLE_PCBNG
  | typeof Constants.CAD_GEDA_PCB
  | typeof Constants.CAD_ORCAD
  | typeof Constants.CAD_DIPTRACE
  | null

export interface ExtensionMatcher {
  ext: string
  cad: GerberCad | GerberCad[]
}

export interface FilenameMatcher {
  match: RegExp
  cad: GerberCad | GerberCad[]
}

export interface LayerType {
  type: GerberType
  side: GerberSide
  matchers: Array<ExtensionMatcher | FilenameMatcher>
}

export interface LayerTest {
  type: GerberType
  side: GerberSide
  match: RegExp
  cad: GerberCad
}

export interface LayerTestMatch extends LayerTest {
  filename: string
}
