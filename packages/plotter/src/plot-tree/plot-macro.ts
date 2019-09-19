// plot a tool macro as shapes
import * as Parser from '@tracespace/parser'
import {Position} from '../types'
import {rotateAndShift, roundToPrecision, positionsEqual, PI} from '../utils'
import * as Nodes from './nodes'
import * as Geo from './geometry'
import {getCenterAngles} from './arc-segment'

type ParamsMap = {[param: string]: number}

export function plotMacro(
  macro: Parser.ToolMacro,
  params: number[],
  origin: Position
): Nodes.LayeredShape {
  const paramMap = params.reduce<ParamsMap>(
    (result, value, i) => ({...result, [`$${i + 1}`]: value}),
    {}
  )
  const shapes: Nodes.Shape[] = []

  macro.blocks.forEach(block => {
    if (block.type === Parser.MACRO_VARIABLE) {
      paramMap[block.name] = solveExpression(block.value, paramMap)
    } else if (block.type === Parser.MACRO_PRIMITIVE) {
      const mods = block.modifiers.map(m => solveExpression(m, paramMap))

      switch (block.code) {
        case Parser.MACRO_CIRCLE: {
          const [exposure, diameter, cx0, cy0, degrees] = mods
          const r = diameter / 2
          const [cx, cy] = rotateAndShift([cx0, cy0], origin, degrees)
          const circle = Geo.circle(cx, cy, r)

          return shapes.push(
            exposure === 1
              ? circle
              : Geo.clearOutline(Geo.shapeToSegments(circle))
          )
        }

        case Parser.MACRO_VECTOR_LINE: {
          const [exposure, width, sx, sy, ex, ey, degrees] = mods
          const [dy, dx] = [ey - sy, ex - sx]
          const halfWid = width / 2
          const dist = Math.sqrt(dy ** 2 + dx ** 2)
          const [xOff, yOff] = [(halfWid * dx) / dist, (halfWid * dy) / dist]
          const polygon = Geo.polygon(
            ([
              [sx + xOff, sy - yOff],
              [ex + xOff, ey - yOff],
              [ex - xOff, ey + yOff],
              [sx - xOff, sy + yOff],
            ] as Position[]).map(p => rotateAndShift(p, origin, degrees))
          )

          return shapes.push(
            exposure === 1
              ? polygon
              : Geo.clearOutline(Geo.shapeToSegments(polygon))
          )
        }

        case Parser.MACRO_CENTER_LINE: {
          const [exposure, width, height, cx, cy, degrees] = mods
          const [halfWidth, halfHeight] = [width / 2, height / 2]
          const polygon = Geo.polygon(
            ([
              [cx - halfWidth, cy - halfHeight],
              [cx + halfWidth, cy - halfHeight],
              [cx + halfWidth, cy + halfHeight],
              [cx - halfWidth, cy + halfHeight],
            ] as Position[]).map(p => rotateAndShift(p, origin, degrees))
          )

          return shapes.push(
            exposure === 1
              ? polygon
              : Geo.clearOutline(Geo.shapeToSegments(polygon))
          )
        }

        case Parser.MACRO_OUTLINE: {
          const [exposure, , ...coords] = mods.slice(0, -1)
          const degrees = mods[mods.length - 1]
          const polygon = Geo.polygon(
            coords
              .reduce<Position[]>((result, coord, i) => {
                return i % 2 === 1
                  ? [...result, [coords[i - 1], coord]]
                  : result
              }, [])
              .map(p => rotateAndShift(p, origin, degrees))
          )

          return shapes.push(
            exposure === 1
              ? polygon
              : Geo.clearOutline(Geo.shapeToSegments(polygon))
          )
        }

        // TODO(mc, 2019-08-26): dedupe this with plot-shape
        case Parser.MACRO_POLYGON: {
          const [exposure, vertices, cx, cy, diameter, degrees] = mods
          const r = diameter / 2
          const step = (2 * PI) / vertices
          const points: Position[] = []
          let i

          for (i = 0; i < vertices; i++) {
            const theta = step * i
            const pointX = cx + r * Math.cos(theta)
            const pointY = cy + r * Math.sin(theta)
            points.push(rotateAndShift([pointX, pointY], origin, degrees))
          }

          const polygon = Geo.polygon(points)

          return shapes.push(
            exposure === 1
              ? polygon
              : Geo.clearOutline(Geo.shapeToSegments(polygon))
          )
        }

        case Parser.MACRO_MOIRE: {
          const rotate = (p: Position): Position =>
            rotateAndShift(p, origin, mods[8])

          const [cx0, cy0, d, ringThx, ringGap, ringN, lineThx, lineLen] = mods
          const [cx, cy] = rotate([cx0, cy0])
          const halfLineThx = lineThx / 2
          const halfLineLen = lineLen / 2

          const radii = []
          let count = 0
          let dRemain = d

          while (dRemain >= 0 && count < ringN) {
            const r = roundToPrecision(dRemain / 2)
            const rHole = roundToPrecision(r - ringThx)

            radii.push(r)
            if (rHole > 0) radii.push(rHole)
            count = count + 1
            dRemain = 2 * (rHole - ringGap)
          }

          const moireShapes: Nodes.SimpleShape[] = [
            Geo.outline(
              radii.reduce<Nodes.PathSegment[]>(
                (segments, r) => [
                  ...segments,
                  ...Geo.shapeToSegments(Geo.circle(cx, cy, r)),
                ],
                []
              )
            ),
            // vertical stroke
            Geo.polygon(
              ([
                [cx0 - halfLineThx, cy0 - halfLineLen],
                [cx0 + halfLineThx, cy0 - halfLineLen],
                [cx0 + halfLineThx, cy0 + halfLineLen],
                [cx0 - halfLineThx, cy0 + halfLineLen],
              ] as Position[]).map(rotate)
            ),
            // horizontal stroke
            Geo.polygon(
              ([
                [cx0 - halfLineLen, cy0 - halfLineThx],
                [cx0 + halfLineLen, cy0 - halfLineThx],
                [cx0 + halfLineLen, cy0 + halfLineThx],
                [cx0 - halfLineLen, cy0 + halfLineThx],
              ] as Position[]).map(rotate)
            ),
          ]

          return shapes.push(Geo.layeredShape(moireShapes))
        }

        case Parser.MACRO_THERMAL: {
          const [cx0, cy0, od, id, gap, degrees] = mods
          const center = rotateAndShift([cx0, cy0], origin, degrees)
          const [or, ir] = [od / 2, id / 2]
          const halfGap = gap / 2
          const oIntSquare = or ** 2 - halfGap ** 2
          const iIntSquare = ir ** 2 - halfGap ** 2
          const oInt = Math.sqrt(oIntSquare)
          const iInt = iIntSquare >= 0 ? Math.sqrt(iIntSquare) : halfGap
          const positions = [0, 90, 180, 270]
          const segments: Nodes.PathSegment[] = []

          positions.forEach(rot => {
            const points = ([
              [iInt, halfGap],
              [oInt, halfGap],
              [halfGap, oInt],
              [halfGap, iInt],
            ] as Position[])
              .map(p => rotateAndShift(p, [cx0, cy0], rot))
              .map(p => rotateAndShift(p, origin, degrees))

            const [os, oe, , oSweep] = getCenterAngles(
              points[1],
              points[2],
              center,
              Nodes.CCW
            )

            segments.push(
              Geo.line(points[0], points[1]),
              Geo.arc(os, oe, center, or, oSweep, Nodes.CCW),
              Geo.line(points[2], points[3])
            )

            if (!positionsEqual(points[0], points[3])) {
              const [is, ie, , iSweep] = getCenterAngles(
                points[3],
                points[0],
                center,
                Nodes.CW
              )

              segments.push(Geo.arc(is, ie, center, ir, iSweep, Nodes.CW))
            }
          })

          return shapes.push(Geo.outline(segments))
        }
      }
    }
  })

  return Geo.layeredShape(shapes)
}

function solveExpression(
  expression: Parser.MacroValue,
  params: ParamsMap
): number {
  if (typeof expression === 'number') return expression
  if (typeof expression === 'string') return params[expression]

  const left = solveExpression(expression.left, params)
  const right = solveExpression(expression.right, params)

  switch (expression.operator) {
    case '+':
      return left + right
    case '-':
      return left - right
    case 'x':
      return left * right
    case '/':
      return left / right
  }

  return 0
}
