// Tests for the MainLayer interface
import {vi, describe, beforeEach, afterEach, it, expect} from 'vitest'
import * as td from 'testdouble'

import * as Parser from '@tracespace/parser'

import * as Tree from '../tree'
import * as BoundingBox from '../bounding-box'
import type {MainLayer} from '../main-layer'
import {createMainLayer} from '../main-layer'

vi.mock('../bounding-box', () => td.object<unknown>())

describe('adding to the main image layer', () => {
  let subject: MainLayer

  beforeEach(() => {
    td.when(BoundingBox.empty()).thenReturn([0, 0, 0, 0])

    subject = createMainLayer()
  })

  afterEach(() => {
    td.reset()
  })

  it('should create an empty image by default', () => {
    const result = subject.get()

    expect(result).to.eql({
      type: Tree.IMAGE_LAYER,
      size: [0, 0, 0, 0],
      children: [],
    })
  })

  it('should emit the same image if given no graphic', () => {
    const result = subject.add({type: Parser.DONE}, [])

    expect(result).to.eql({
      type: Tree.IMAGE_LAYER,
      size: [0, 0, 0, 0],
      children: [],
    })
  })

  it('should add graphics to the image', () => {
    const node1 = {type: Parser.GRAPHIC} as Parser.Graphic
    const node2 = {type: Parser.GRAPHIC} as Parser.Graphic

    const graphic1: Tree.ImageGraphic = {
      type: Tree.IMAGE_PATH,
      width: 1,
      segments: [{type: Tree.LINE, start: [2, 3], end: [4, 5]}],
    }
    const graphic2: Tree.ImageGraphic = {
      type: Tree.IMAGE_SHAPE,
      shape: {type: Tree.CIRCLE, cx: 6, cy: 7, r: 8},
    }

    const size1: Tree.SizeEnvelope = [9, 10, 11, 12]
    const size2: Tree.SizeEnvelope = [13, 14, 15, 16]
    const expectedSize: Tree.SizeEnvelope = [17, 18, 19, 20]

    td.when(BoundingBox.fromGraphic(graphic1)).thenReturn(size1)
    td.when(BoundingBox.fromGraphic(graphic2)).thenReturn(size2)

    td.when(BoundingBox.add([0, 0, 0, 0], size1)).thenReturn(size1)
    td.when(BoundingBox.add(size1, size2)).thenReturn(expectedSize)

    subject.add(node1, [graphic1])
    const result = subject.add(node2, [graphic2])

    expect(result).to.eql({
      type: Tree.IMAGE_LAYER,
      size: expectedSize,
      children: [graphic1, graphic2],
    })
  })
})
