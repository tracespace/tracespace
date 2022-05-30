import {describe, it, expect} from 'vitest'
import {createParser} from '@tracespace/parser'
import {collectDrillStats, DrillStats} from '..'

describe('@tracespace/stats', () => {
  it('should return an empty result', () => {
    const expected: DrillStats = {
      drillHits: [],
      drillRoutes: [],
      totalDrills: 0,
      totalRoutes: 0,
      minDrillSize: 0,
      maxDrillSize: 0,
    }

    expect(collectDrillStats([])).to.eql(expected)
  })

  it('should collect drill stats', () => {
    const parser = createParser()
    parser.feed(
      'M48\nM72\nINCH,TZ\nT01C0.0240\nT02C0.0335\n%\nG90\nT01\nX16910Y10810\nX15010Y12410\nX15100Y14300\nT02\nX26450Y10700\nT1\nG00X0Y0\nG01X2500Y2500\nG01X5000Y0\nM30\n'
    )

    const tree = parser.result()

    const expected: DrillStats = {
      drillHits: [
        {count: 3, diameter: 0.024},
        {count: 1, diameter: 0.0335},
      ],
      drillRoutes: [{count: 2, diameter: 0.024}],
      totalDrills: 4,
      totalRoutes: 2,
      minDrillSize: 0.024,
      maxDrillSize: 0.0335,
    }

    expect(collectDrillStats([tree])).to.eql(expected)
  })
})
