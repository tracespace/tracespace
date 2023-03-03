// @vitest-environment jsdom
import {vi, describe, it, expect, afterEach} from 'vitest'
import * as td from 'testdouble'

import {callWorker} from '../call-worker'

import * as subject from '..'

vi.mock('../call-worker', () => td.object<unknown>())

describe('render files', () => {
  afterEach(() => {
    td.reset()
  })

  it('should pass files in a message the worker', async () => {
    const files = [new File(['foo'], 'foo.gbr')]

    td.when(callWorker({type: 'initialRender', files})).thenResolve({
      layers: [],
    })

    const result = await subject.render(files)
    expect(result).to.eql({layers: []})
  })
})
