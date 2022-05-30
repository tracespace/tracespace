// Tests for @tracespace/cli
import path from 'node:path'
import fs from 'node:fs/promises'

import {temporaryDirectory} from 'tempy'
import {describe, it, beforeEach, afterEach, expect} from 'vitest'

import {run} from './run'

const FIXTURES = [
  'pads/circle.gbr',
  'pads/obround.gbr',
  'pads/polygon.gbr',
  'pads/rectangle.gbr',
]

const getGerberFixturePath = (name: string) => {
  return require.resolve(`@tracespace/fixtures/gerbers/${name}`)
}

const readFile = async (file: string) => {
  return fs.readFile(file, 'utf8')
}

const readJson = async (file: string) => {
  return fs
    .readFile(file, 'utf8')
    .then(contents => JSON.parse(contents) as Record<string, unknown>)
}

describe('@tracespace/cli render', () => {
  let outDir: string

  beforeEach(() => {
    outDir = temporaryDirectory({prefix: 'tracespace'})
  })

  afterEach(async () => {
    return fs.rm(outDir, {force: true, recursive: true})
  })

  FIXTURES.forEach(fixtureName => {
    const source = getGerberFixturePath(fixtureName)

    it(`should render ${fixtureName}`, async () => {
      const outName = path.join(outDir, path.basename(source))
      const parseFile = `${outName}.parse.json`
      const plotFile = `${outName}.plot.json`
      const renderFile = `${outName}.svg`

      await run('render', source, '--out', outDir, '--debug')

      return Promise.all([
        readJson(parseFile),
        readJson(plotFile),
        readFile(renderFile),
      ]).then(([parseResults, plotResults, renderResults]) => {
        expect(parseResults).toMatchSnapshot('parse')
        expect(plotResults).toMatchSnapshot('plot')
        expect(renderResults).toMatchSnapshot('render')
      })
    })
  })
})
