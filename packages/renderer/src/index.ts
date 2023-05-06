import {s} from 'hastscript'

import type {ImageTree} from '@tracespace/plotter'

import {renderGraphic, renderTreeGraphics, sizeToViewBox} from './render'
import type {SvgElement, ViewBox} from './types'

export {sizeToViewBox} from './render'

export {renderGraphic} from './render'

export type {SvgElement, ViewBox} from './types'

export const BASE_SVG_PROPS = {
  version: '1.1',
  xmlns: 'http://www.w3.org/2000/svg',
  'xmlns:xlink': 'http://www.w3.org/1999/xlink',
}

export const BASE_IMAGE_PROPS = {
  'stroke-linecap': 'round',
  'stroke-linejoin': 'round',
  'stroke-width': '0',
  // 'fill-rule': 'evenodd',
  // 'clip-rule': 'evenodd',
  fill: 'currentColor',
  stroke: 'currentColor',
}

export function render(image: ImageTree, viewBox?: ViewBox): SvgElement {
  const {units, size} = image

  if (viewBox === undefined) {
    viewBox = sizeToViewBox(size)
  }

  return s(
    'svg',
    {
      ...BASE_SVG_PROPS,
      ...BASE_IMAGE_PROPS,
      viewBox: viewBox.join(' '),
      width: `${viewBox[2]}${units}`,
      height: `${viewBox[3]}${units}`,
    },
    ...renderTreeGraphics(image)
  )
}

export function renderFragment(image: ImageTree): SvgElement {
  return s('g', {}, image.children.map(renderGraphic))
}
