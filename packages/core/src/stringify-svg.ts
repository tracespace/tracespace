import {toHtml} from 'hast-util-to-html'

import type {SvgElement} from '@tracespace/renderer'

export function stringifySvg(element: SvgElement): string {
  return toHtml(element, {space: 'svg'})
}
