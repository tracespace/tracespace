import {describe, it, expect} from 'vitest'

import {LINE} from '@tracespace/plotter'

import * as subject from '../walk-paths'

describe('path walker', () => {
  it("should walk a path that's already in order", () => {
    const result = subject.walkPaths([
      {type: LINE, start: [0, 0], end: [0, 1]},
      {type: LINE, start: [0, 1], end: [1, 1]},
      {type: LINE, start: [1, 1], end: [1, 0]},
      {type: LINE, start: [1, 0], end: [0, 0]},
    ])

    expect(result).to.eql([
      {
        start: [0, 0],
        end: [0, 0],
        segments: [
          {type: LINE, start: [0, 0], end: [0, 1]},
          {type: LINE, start: [0, 1], end: [1, 1]},
          {type: LINE, start: [1, 1], end: [1, 0]},
          {type: LINE, start: [1, 0], end: [0, 0]},
        ],
      },
    ])
  })

  it('should reorganize an outline to be in order', () => {
    const result = subject.walkPaths([
      {type: LINE, start: [0, 0], end: [0, 1]},
      {type: LINE, start: [1, 1], end: [1, 0]},
      {type: LINE, start: [0, 1], end: [1, 1]},
      {type: LINE, start: [1, 0], end: [0, 0]},
    ])

    expect(result).to.eql([
      {
        start: [0, 0],
        end: [0, 0],
        segments: [
          {type: LINE, start: [0, 0], end: [0, 1]},
          {type: LINE, start: [0, 1], end: [1, 1]},
          {type: LINE, start: [1, 1], end: [1, 0]},
          {type: LINE, start: [1, 0], end: [0, 0]},
        ],
      },
    ])
  })

  it('should reorganize an outline drawn in different directions', () => {
    const result = subject.walkPaths([
      {type: LINE, start: [0, 0], end: [0, 1]},
      {type: LINE, start: [0, 0], end: [1, 0]},
      {type: LINE, start: [1, 1], end: [0, 1]},
      {type: LINE, start: [1, 1], end: [1, 0]},
    ])

    expect(result).to.eql([
      {
        start: [0, 0],
        end: [0, 0],
        segments: [
          {type: LINE, start: [0, 0], end: [0, 1]},
          {type: LINE, start: [0, 1], end: [1, 1]},
          {type: LINE, start: [1, 1], end: [1, 0]},
          {type: LINE, start: [1, 0], end: [0, 0]},
        ],
      },
    ])
  })

  it('should deduplicate matching linear segments', () => {
    const result = subject.walkPaths([
      {type: LINE, start: [0, 0], end: [0, 1]},
      {type: LINE, start: [0, 0], end: [0, 1]},
      {type: LINE, start: [0, 1], end: [1, 1]},
      {type: LINE, start: [1, 1], end: [0, 1]},
      {type: LINE, start: [1, 1], end: [1, 0]},
      {type: LINE, start: [1, 0], end: [0, 0]},
    ])

    expect(result).to.eql([
      {
        start: [0, 0],
        end: [0, 0],
        segments: [
          {type: LINE, start: [0, 0], end: [0, 1]},
          {type: LINE, start: [0, 1], end: [1, 1]},
          {type: LINE, start: [1, 1], end: [1, 0]},
          {type: LINE, start: [1, 0], end: [0, 0]},
        ],
      },
    ])
  })
})
