// SVG string to image data utilities

import miniSvgDataUri from 'mini-svg-data-uri'

export function svgToDataUri(svg: string): string {
  return miniSvgDataUri(svg)
}
