import {getCommonCad} from './get-common-cad'
import {getMatches} from './get-matches'
import {layerTypes} from './layer-types'

import type {
  LayerIdentityMap,
  ValidLayer,
  ValidatedLayer,
  LayerIdentity,
  LayerTestMatch,
  GerberType,
  GerberSide,
  GerberCad,
} from './types'

export * from './constants'
export * from './types'

export function identifyLayers(filenames: string | string[]): LayerIdentityMap {
  if (typeof filenames === 'string') filenames = [filenames]

  const matches = filenames.flatMap(f => getMatches(f))
  const commonCad = getCommonCad(matches)

  return Object.fromEntries(
    filenames.map(filename => {
      const match = _selectMatch(matches, filename, commonCad)
      const layerId = match
        ? {type: match.type, side: match.side}
        : {type: null, side: null}

      return [filename, layerId]
    })
  )
}

export function getAllLayers(): ValidLayer[] {
  return layerTypes
    .map(layer => ({type: layer.type, side: layer.side}))
    .filter((layer): layer is ValidLayer => layer.type !== null)
}

export function validate<T extends {side: string | null; type: string | null}>(
  target: T
): ValidatedLayer {
  const valid = layerTypes.some(layer => {
    return layer.side === target.side && layer.type === target.type
  })

  const validSide = layerTypes.some(layer => layer.side === target.side)
  const validType = layerTypes.some(layer => layer.type === target.type)

  return {
    valid,
    side: validSide ? (target.side as GerberSide) : null,
    type: validType ? (target.type as GerberType) : null,
  }
}

function _selectMatch(
  matches: LayerTestMatch[],
  filename: string,
  cad: GerberCad
): LayerIdentity | null {
  const filenameMatches = matches.filter(match => match.filename === filename)
  const result = filenameMatches.find(match => match.cad === cad)

  return result ?? filenameMatches[0] ?? null
}
