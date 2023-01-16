import {DRILL, GERBER} from '@tracespace/parser'
import {TYPE_DRILL, SIDE_ALL, identifyLayers} from '@tracespace/identify-layers'

import type {LayerIdentity} from '@tracespace/identify-layers'
import type {GerberTree} from '@tracespace/parser'

export interface ParsedLayer {
  id: string
  filename: string
  parseTree: GerberTree
}

export function determineLayerTypes(
  layers: ParsedLayer[]
): Record<string, LayerIdentity> {
  const gerberFilenames = layers
    .filter(layer => layer.parseTree.filetype === GERBER)
    .map(layer => layer.filename)

  const identitiesByFilename = identifyLayers(gerberFilenames)

  return Object.fromEntries(
    layers.map(({id, filename, parseTree}) => {
      const layerIdentity: LayerIdentity =
        parseTree.filetype === DRILL
          ? {type: TYPE_DRILL, side: SIDE_ALL}
          : identitiesByFilename[filename]

      return [id, layerIdentity]
    })
  )
}
