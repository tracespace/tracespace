import {getCommonCad} from './get-common-cad'
import {getMatches} from './get-matches'
import {layerTypes} from './layer-types'
import {flatMap} from './flat-map'

import {
  WhatsThatGerberResult,
  ValidLayer,
  ValidatedLayer,
  LayerResult,
  LayerTestMatch,
  GerberType,
  GerberSide,
  GerberCad,
} from './types'

export * from './constants'
export * from './types'

export function identifyLayers(
  filenames: string | string[]
): WhatsThatGerberResult {
  if (typeof filenames === 'string') filenames = [filenames]

  const matches = flatMap(filenames, getMatches)
  const commonCad = getCommonCad(matches)

  return filenames.reduce<WhatsThatGerberResult>((result, filename) => {
    const match = _selectMatch(matches, filename, commonCad)

    result[filename] =
      match !== null
        ? {type: match.type, side: match.side}
        : {type: null, side: null}

    return result
  }, {})
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
): LayerResult | null {
  const filenameMatches = matches.filter(match => match.filename === filename)
  const result = filenameMatches.find(match => match.cad === cad)

  return result || filenameMatches[0] || null
}
