import {describe, it, expect} from 'vitest'

import {LINE, IMAGE_REGION, IMAGE_PATH} from '@tracespace/plotter'
import * as subject from '../fill-gaps'

describe('gap filler', () => {
  it('should return empty output if given empty input', () => {
    const result = subject.fillGaps([], 0.01)

    expect(result).to.eql([[], []])
  })

  it('should return the segments if no gaps', () => {
    const result = subject.fillGaps(
      [
        {
          start: [0, 0],
          end: [0, 0],
          segments: [
            {type: LINE, start: [0, 0], end: [0, 1]},
            {type: LINE, start: [0, 1], end: [1, 0]},
            {type: LINE, start: [1, 0], end: [0, 0]},
          ],
        },
        {
          start: [0.25, 0.25],
          end: [0.25, 0.25],
          segments: [
            {type: LINE, start: [0.25, 0.25], end: [0.25, 0.75]},
            {type: LINE, start: [0.25, 0.75], end: [0.75, 0.25]},
            {type: LINE, start: [0.75, 0.25], end: [0.25, 0.25]},
          ],
        },
      ],
      0.01
    )

    expect(result[0]).to.eql([
      {
        type: IMAGE_REGION,
        segments: [
          {type: LINE, start: [0, 0], end: [0, 1]},
          {type: LINE, start: [0, 1], end: [1, 0]},
          {type: LINE, start: [1, 0], end: [0, 0]},
        ],
      },
      {
        type: IMAGE_REGION,
        segments: [
          {type: LINE, start: [0.25, 0.25], end: [0.25, 0.75]},
          {type: LINE, start: [0.25, 0.75], end: [0.75, 0.25]},
          {type: LINE, start: [0.75, 0.25], end: [0.25, 0.25]},
        ],
      },
    ])
    expect(result[1]).to.eql([])
  })

  it('should fill a gap in a single path', () => {
    const result = subject.fillGaps(
      [
        {
          start: [0, 0],
          end: [0, 0.009],
          segments: [
            {type: LINE, start: [0, 0], end: [0, 1]},
            {type: LINE, start: [0, 1], end: [1, 0]},
            {type: LINE, start: [1, 0], end: [0, 0.009]},
          ],
        },
      ],
      0.01
    )

    expect(result[0]).to.eql([
      {
        type: IMAGE_REGION,
        segments: [
          {type: LINE, start: [0, 0], end: [0, 1]},
          {type: LINE, start: [0, 1], end: [1, 0]},
          {type: LINE, start: [1, 0], end: [0, 0.009]},
          {type: LINE, start: [0, 0.009], end: [0, 0]},
        ],
      },
    ])
    expect(result[1]).to.eql([])
  })

  it('should fill gaps between multiple paths drawn clockwise', () => {
    const result = subject.fillGaps(
      [
        {
          start: [0, 0],
          end: [1, 0.991],
          segments: [
            {type: LINE, start: [0, 0], end: [0, 1]},
            {type: LINE, start: [0, 1], end: [1, 0.991]},
          ],
        },
        {
          start: [1, 1],
          end: [0, 0.009],
          segments: [
            {type: LINE, start: [1, 1], end: [1, 0]},
            {type: LINE, start: [1, 0], end: [0, 0.009]},
          ],
        },
      ],
      0.01
    )

    expect(result[0]).to.eql([
      {
        type: IMAGE_REGION,
        segments: [
          {type: LINE, start: [0, 0], end: [0, 1]},
          {type: LINE, start: [0, 1], end: [1, 0.991]},
          {type: LINE, start: [1, 0.991], end: [1, 1]},
          {type: LINE, start: [1, 1], end: [1, 0]},
          {type: LINE, start: [1, 0], end: [0, 0.009]},
          {type: LINE, start: [0, 0.009], end: [0, 0]},
        ],
      },
    ])
    expect(result[1]).to.eql([])
  })

  it('should fill gaps between multiple paths drawn counterclockwise', () => {
    const result = subject.fillGaps(
      [
        {
          start: [1, 0.991],
          end: [0, 0],
          segments: [
            {type: LINE, start: [1, 0.991], end: [0, 1]},
            {type: LINE, start: [0, 1], end: [0, 0]},
          ],
        },
        {
          start: [0, 0.009],
          end: [1, 1],
          segments: [
            {type: LINE, start: [0, 0.009], end: [1, 0]},
            {type: LINE, start: [1, 0], end: [1, 1]},
          ],
        },
      ],
      0.01
    )

    expect(result[0]).to.eql([
      {
        type: IMAGE_REGION,
        segments: [
          {type: LINE, start: [1, 0.991], end: [0, 1]},
          {type: LINE, start: [0, 1], end: [0, 0]},
          {type: LINE, start: [0, 0], end: [0, 0.009]},
          {type: LINE, start: [0, 0.009], end: [1, 0]},
          {type: LINE, start: [1, 0], end: [1, 1]},
          {type: LINE, start: [1, 1], end: [1, 0.991]},
        ],
      },
    ])
    expect(result[1]).to.eql([])
  })

  it('should fill gaps between paths with a "common" end', () => {
    const result = subject.fillGaps(
      [
        {
          start: [0, 0],
          end: [1, 0.991],
          segments: [
            {type: LINE, start: [0, 0], end: [0, 1]},
            {type: LINE, start: [0, 1], end: [1, 0.991]},
          ],
        },
        {
          start: [0, 0.009],
          end: [1, 1],
          segments: [
            {type: LINE, start: [0, 0.009], end: [1, 0]},
            {type: LINE, start: [1, 0], end: [1, 1]},
          ],
        },
      ],
      0.01
    )

    expect(result[0]).to.eql([
      {
        type: IMAGE_REGION,
        segments: [
          {type: LINE, start: [0, 0], end: [0, 1]},
          {type: LINE, start: [0, 1], end: [1, 0.991]},
          {type: LINE, start: [1, 0.991], end: [1, 1]},
          {type: LINE, start: [1, 1], end: [1, 0]},
          {type: LINE, start: [1, 0], end: [0, 0.009]},
          {type: LINE, start: [0, 0.009], end: [0, 0]},
        ],
      },
    ])
    expect(result[1]).to.eql([])
  })

  it('should fill gaps between paths with a "common" start', () => {
    const result = subject.fillGaps(
      [
        {
          start: [1, 0.991],
          end: [0, 0],
          segments: [
            {type: LINE, start: [1, 0.991], end: [0, 1]},
            {type: LINE, start: [0, 1], end: [0, 0]},
          ],
        },
        {
          start: [1, 1],
          end: [0, 0.009],
          segments: [
            {type: LINE, start: [1, 1], end: [1, 0]},
            {type: LINE, start: [1, 0], end: [0, 0.009]},
          ],
        },
      ],
      0.01
    )

    expect(result[0]).to.eql([
      {
        type: IMAGE_REGION,
        segments: [
          {type: LINE, start: [1, 0.991], end: [0, 1]},
          {type: LINE, start: [0, 1], end: [0, 0]},
          {type: LINE, start: [0, 0], end: [0, 0.009]},
          {type: LINE, start: [0, 0.009], end: [1, 0]},
          {type: LINE, start: [1, 0], end: [1, 1]},
          {type: LINE, start: [1, 1], end: [1, 0.991]},
        ],
      },
    ])
  })
})
