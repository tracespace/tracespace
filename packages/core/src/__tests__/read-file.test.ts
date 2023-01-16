// @vitest-environment jsdom
import fs from 'node:fs/promises'
import {describe, it, expect} from 'vitest'
import {temporaryFile} from 'tempy'

import * as subject from '../read-file'

describe('file reader', () => {
  it('should read a browser file', async () => {
    const file = new File(['fizzbuzz'], 'foo.gbr')
    const result = await subject.readFile(file)

    expect(result).to.eql({filename: 'foo.gbr', contents: 'fizzbuzz'})
  })

  it('should read a node path', async () => {
    const file = temporaryFile({name: 'foo.gbr'})
    await fs.writeFile(file, 'fizzbuzz', 'utf8')

    const result = await subject.readFile(file)
    expect(result).to.eql({filename: 'foo.gbr', contents: 'fizzbuzz'})
  })
})
