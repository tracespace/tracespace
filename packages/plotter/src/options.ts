import type {
  GerberTree,
  UnitsType,
  Format,
  ZeroSuppression,
} from '@tracespace/parser'
import {
  UNITS,
  COORDINATE_FORMAT,
  GRAPHIC,
  COMMENT,
  LEADING,
  TRAILING,
  IN,
} from '@tracespace/parser'

export interface PlotOptions {
  units: UnitsType
  coordinateFormat: Format
  zeroSuppression: ZeroSuppression
}

const FORMAT_COMMENT_RE = /FORMAT={?(\d):(\d)/

export function getPlotOptions(tree: GerberTree): PlotOptions {
  const {children: treeNodes} = tree
  let units: UnitsType | null = null
  let coordinateFormat: Format | null = null
  let zeroSuppression: ZeroSuppression | null = null
  let index = 0

  while (
    index < treeNodes.length &&
    (units === null || coordinateFormat === null || zeroSuppression === null)
  ) {
    const node = treeNodes[index]

    switch (node.type) {
      case UNITS: {
        units = node.units
        break
      }

      case COORDINATE_FORMAT: {
        coordinateFormat = node.format
        zeroSuppression = node.zeroSuppression
        break
      }

      case GRAPHIC: {
        const {coordinates} = node

        for (const coordinate of Object.values(coordinates)) {
          if (zeroSuppression !== null) break

          if (coordinate!.endsWith('0') || coordinate!.includes('.')) {
            zeroSuppression = LEADING
          } else if (coordinate!.startsWith('0')) {
            zeroSuppression = TRAILING
          }
        }

        break
      }

      case COMMENT: {
        const {comment} = node
        const formatMatch = FORMAT_COMMENT_RE.exec(comment)

        if (/suppress trailing/i.test(comment)) {
          zeroSuppression = TRAILING
        } else if (/(suppress leading|keep zeros)/i.test(comment)) {
          zeroSuppression = LEADING
        }

        if (formatMatch) {
          coordinateFormat = [Number(formatMatch[1]), Number(formatMatch[2])]
        }

        break
      }

      default:
    }

    index += 1
  }

  return {
    units: units ?? IN,
    coordinateFormat: coordinateFormat ?? [2, 4],
    zeroSuppression: zeroSuppression ?? LEADING,
  }
}
