import {LayerTestMatch, GerberCad} from './types'

interface MaxResult {
  max: number
  name: string | null
}

export function getCommonCad(matches: LayerTestMatch[]): GerberCad {
  let mode: GerberCad = null
  let modeCount = 0
  const countsByCad: {[cad: string]: number | undefined} = {}

  matches.forEach(match => {
    const {cad} = match
    if (cad !== null) {
      const count = (countsByCad[cad] || 0) + 1
      if (count > modeCount) {
        modeCount = count
        mode = cad
      }
      countsByCad[cad] = count
    }
  })

  return mode
}
