import * as Parser from '@tracespace/parser'

export interface PlotOptions {
  units: Parser.UnitsType
  coordinateFormat: Parser.Format
  zeroSuppression: Parser.ZeroSuppression
}

const FORMAT_COMMENT_RE = /FORMAT={?(\d):(\d)/

export function getPlotOptions(tree: Parser.GerberTree): PlotOptions {
  const {children: treeNodes} = tree
  let units: Parser.UnitsType | null = null
  let coordinateFormat: Parser.Format | null = null
  let zeroSuppression: Parser.ZeroSuppression | null = null
  let index = 0

  while (
    index < treeNodes.length &&
    (units === null || coordinateFormat === null || zeroSuppression === null)
  ) {
    const node = treeNodes[index]

    switch (node.type) {
      case Parser.UNITS: {
        units = node.units
        break
      }

      case Parser.COORDINATE_FORMAT: {
        coordinateFormat = node.format
        zeroSuppression = node.zeroSuppression
        break
      }

      case Parser.GRAPHIC: {
        const {coordinates} = node

        for (const coordinate of Object.values(coordinates)) {
          if (zeroSuppression !== null) break

          if (coordinate!.endsWith('0') || coordinate!.includes('.')) {
            zeroSuppression = Parser.LEADING
          } else if (coordinate!.startsWith('0')) {
            zeroSuppression = Parser.TRAILING
          }
        }

        break
      }

      case Parser.COMMENT: {
        const {comment} = node
        const formatMatch = FORMAT_COMMENT_RE.exec(comment)

        if (/suppress trailing/i.test(comment)) {
          zeroSuppression = Parser.TRAILING
        } else if (/(suppress leading|keep zeros)/i.test(comment)) {
          zeroSuppression = Parser.LEADING
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
    units: units ?? Parser.IN,
    coordinateFormat: coordinateFormat ?? [2, 4],
    zeroSuppression: zeroSuppression ?? Parser.LEADING,
  }
}
