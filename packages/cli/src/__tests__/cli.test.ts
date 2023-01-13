import fs from 'node:fs/promises'
import path from 'node:path'
import {describe, it, beforeEach, expect} from 'vitest'
import {temporaryDirectory} from 'tempy'

import {ROOT, GERBER, DRILL} from '@tracespace/parser'
import {IMAGE} from '@tracespace/plotter'

import * as subject from '..'

describe.skip('tracespace CLI', () => {
  let outputDirectory: string

  beforeEach(() => {
    outputDirectory = temporaryDirectory()
  })

  it('should parse gerber files', async () => {
    await subject.run([
      'parse',
      './packages/fixtures/gerbers/pads/circle.gbr',
      './packages/fixtures/gerbers/drill/hit.drl',
      '--output',
      outputDirectory,
    ])

    const result1 = await fs.readFile(
      path.join(outputDirectory, 'circle.gbr.parse.json'),
      'utf8'
    )
    const result2 = await fs.readFile(
      path.join(outputDirectory, 'hit.drl.parse.json'),
      'utf8'
    )

    expect(JSON.parse(result1)).to.include({type: ROOT, filetype: GERBER})
    expect(JSON.parse(result2)).to.include({type: ROOT, filetype: DRILL})
  })

  it('should plot gerber files', async () => {
    await subject.run([
      'plot',
      './packages/fixtures/gerbers/pads/circle.gbr',
      './packages/fixtures/gerbers/drill/hit.drl',
      '--output',
      outputDirectory,
    ])

    const result1 = await fs.readFile(
      path.join(outputDirectory, 'circle.gbr.plot.json'),
      'utf8'
    )
    const result2 = await fs.readFile(
      path.join(outputDirectory, 'hit.drl.plot.json'),
      'utf8'
    )

    expect(JSON.parse(result1)).to.include({type: IMAGE})
    expect(JSON.parse(result2)).to.include({type: IMAGE})
  })

  it('should render gerber layer files', async () => {
    await subject.run([
      'render',
      './packages/fixtures/gerbers/pads/circle.gbr',
      './packages/fixtures/gerbers/drill/hit.drl',
      '--output',
      outputDirectory,
    ])

    const result1 = await fs.readFile(
      path.join(outputDirectory, 'circle.gbr.svg'),
      'utf8'
    )
    const result2 = await fs.readFile(
      path.join(outputDirectory, 'hit.drl.svg'),
      'utf8'
    )

    expect(result1).to.match(/^<svg.*<\/svg>$/m)
    expect(result2).to.match(/^<svg.*<\/svg>$/m)
  })
})
