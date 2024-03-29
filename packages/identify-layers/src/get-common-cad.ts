import type {LayerTestMatch, GerberCad} from './types'

export function getCommonCad(matches: LayerTestMatch[]): GerberCad | undefined {
  let mode: GerberCad | undefined
  let modeCount = 0
  const countsByCad: Partial<Record<string, number>> = {}

  for (const match of matches) {
    const {cad} = match
    if (cad !== undefined) {
      const count = (countsByCad[cad] ?? 0) + 1
      if (count > modeCount) {
        modeCount = count
        mode = cad
      }

      countsByCad[cad] = count
    }
  }

  return mode
}
