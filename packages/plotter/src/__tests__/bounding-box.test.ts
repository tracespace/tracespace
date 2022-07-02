// Tests for the bounding box module
import {describe, it, expect} from 'vitest'

import {Box} from '../tree'
import * as subject from '../bounding-box'

describe('bounding box calculations', () => {
  it('should return an empty bounding box', () => {
    const result = subject.empty()
    expect(result).to.eql([0, 0, 0, 0])
  })

  it('should add boxes', () => {
    const box1: Box = [1, 2, 3, 4]
    const box2: Box = [5, 6, 7, 8]

    expect(subject.add(box1, box2)).to.eql([1, 2, 7, 8])
    expect(subject.add(box2, box1)).to.eql([1, 2, 7, 8])
  })

  it('should add empty boxes', () => {
    const empty = subject.empty()
    const notEmpty: Box = [1, 2, 3, 4]

    expect(subject.add(empty, notEmpty)).to.eql(notEmpty)
    expect(subject.add(notEmpty, empty)).to.eql(notEmpty)
  })
})
