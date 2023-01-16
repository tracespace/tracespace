import fs from 'node:fs/promises'
import path from 'node:path'
import {describe, it, expect} from 'vitest'
import {temporaryDirectory} from 'tempy'

import * as subject from '../output'

describe('tracespace CLI file output', () => {
  it('should write an svg file', async () => {
    const directory = temporaryDirectory()

    await subject.writeSvg({
      directory,
      basename: 'foo.gbr',
      contents: {type: 'element', tagName: 'svg', children: []},
    })

    const result = await fs.readFile(
      path.join(directory, 'foo.gbr.svg'),
      'utf8'
    )

    expect(result).to.equal('<svg></svg>')
  })

  it('should write a JSON file', async () => {
    const directory = temporaryDirectory()

    await subject.writeJson({
      directory,
      basename: 'foo.gbr',
      contents: {fizz: 'buzz'},
    })

    const result = await fs.readFile(
      path.join(directory, 'foo.gbr.json'),
      'utf8'
    )

    expect(result).to.equal('{\n  "fizz": "buzz"\n}')
  })

  it('should create directories as needed', async () => {
    const directory = path.join(temporaryDirectory(), 'output')

    await subject.writeJson({
      directory,
      basename: 'foo.gbr',
      contents: {fizz: 'buzz'},
    })

    const result = await fs.readFile(
      path.join(directory, 'foo.gbr.json'),
      'utf8'
    )

    expect(result).to.equal('{\n  "fizz": "buzz"\n}')
  })

  it('should disable writes', async () => {
    const directory = temporaryDirectory()

    await subject.writeJson({
      directory,
      basename: 'foo.gbr',
      contents: {fizz: 'buzz'},
      disable: true,
    })

    const result = fs.readFile(path.join(directory, 'foo.gbr.json'), 'utf8')

    await expect(result).to.rejects.toThrow(/ENOENT/)
  })
})
