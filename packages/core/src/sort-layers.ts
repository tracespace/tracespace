import {
  TYPE_COPPER,
  TYPE_SOLDERMASK,
  TYPE_SILKSCREEN,
  TYPE_SOLDERPASTE,
  TYPE_DRILL,
  TYPE_OUTLINE,
} from '@tracespace/identify-layers'

import type {
  SIDE_TOP,
  SIDE_BOTTOM,
  GerberType,
} from '@tracespace/identify-layers'
import type {Layer} from '.'

export interface SideLayers {
  copper: string[]
  solderMask: string[]
  silkScreen: string[]
  solderPaste: string[]
}

export type Side = typeof SIDE_TOP | typeof SIDE_BOTTOM

const toId = ({id}: Layer) => id
const isType = (type: GerberType, side?: Side) => (layer: Layer) => {
  return layer.type === type && (side === undefined || layer.side === side)
}

export function getOutlineLayer(layers: Layer[]): string | undefined {
  return layers.filter(isType(TYPE_OUTLINE)).map(toId)[0]
}

export function getDrillLayers(layers: Layer[]): string[] {
  return layers.filter(isType(TYPE_DRILL)).map(toId)
}

export function getSideLayers(side: Side, layers: Layer[]): SideLayers {
  return {
    copper: layers.filter(isType(TYPE_COPPER, side)).map(toId),
    solderMask: layers.filter(isType(TYPE_SOLDERMASK, side)).map(toId),
    silkScreen: layers.filter(isType(TYPE_SILKSCREEN, side)).map(toId),
    solderPaste: layers.filter(isType(TYPE_SOLDERPASTE, side)).map(toId),
  }
}
