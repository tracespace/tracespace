import {matchers} from './matchers'
import type {LayerTestMatch} from './types'

export function getMatches(filename: string): LayerTestMatch[] {
  return matchers
    .map(m => (m.match.test(filename) ? {...m, filename} : null))
    .filter((m: LayerTestMatch | null): m is LayerTestMatch => m !== null)
}
