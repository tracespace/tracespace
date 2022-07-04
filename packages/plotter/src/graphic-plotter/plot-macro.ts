// Plot a tool macro as shapes
import * as Parser from '@tracespace/parser'

import {
  rotateAndShift,
  roundToPrecision,
  positionsEqual,
  PI,
} from '../coordinate-math'

import * as Tree from '../tree'
import {shapeToSegments} from './plot-shape'
import {getArcPositions} from './plot-path'

type ParametersMap = Record<string, number>

export function plotMacro(
  macro: Parser.ToolMacro,
  parameters: number[],
  origin: Tree.Position
): Tree.LayeredShape {
  const shapes: Tree.ErasableShape[] = []
  const parameterMap = Object.fromEntries(
    parameters.map((value, i) => [`$${i + 1}`, value])
  )

  for (const block of macro.children) {
    if (block.type === Parser.MACRO_VARIABLE) {
      parameterMap[block.name] = solveExpression(block.value, parameterMap)
    } else if (block.type === Parser.MACRO_PRIMITIVE) {
      const mods = block.modifiers.map(m => solveExpression(m, parameterMap))

      shapes.push(...plotPrimitive(block.code, origin, mods))
    }
  }

  return {type: Tree.LAYERED_SHAPE, shapes}
}

function solveExpression(
  expression: Parser.MacroValue,
  parameters: ParametersMap
): number {
  if (typeof expression === 'number') return expression
  if (typeof expression === 'string') return parameters[expression]

  const left = solveExpression(expression.left, parameters)
  const right = solveExpression(expression.right, parameters)

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
}

function plotPrimitive(
  code: Parser.MacroPrimitiveCode | string,
  origin: Tree.Position,
  modifiers: number[]
): Tree.ErasableShape[] {
  switch (code) {
    case Parser.MACRO_CIRCLE: {
      return [plotCircle(origin, modifiers)]
    }

    case Parser.MACRO_VECTOR_LINE: {
      return [plotVectorLine(origin, modifiers)]
    }

    case Parser.MACRO_CENTER_LINE: {
      return [plotCenterLine(origin, modifiers)]
    }

    case Parser.MACRO_OUTLINE: {
      return [plotOutline(origin, modifiers)]
    }

    case Parser.MACRO_POLYGON: {
      return [plotPolygon(origin, modifiers)]
    }

    case Parser.MACRO_MOIRE: {
      return plotMoire(origin, modifiers)
    }

    case Parser.MACRO_THERMAL: {
      return [plotThermal(origin, modifiers)]
    }
  }

  return []
}

function plotCircle(
  origin: Tree.Position,
  modifiers: number[]
): Tree.ErasableShape {
  const [exposure, diameter, cx0, cy0, degrees] = modifiers
  const r = diameter / 2
  const [cx, cy] = rotateAndShift([cx0, cy0], origin, degrees)

  return {type: Tree.CIRCLE, erase: exposure === 0, cx, cy, r}
}

function plotVectorLine(
  origin: Tree.Position,
  modifiers: number[]
): Tree.ErasableShape {
  const [exposure, width, sx, sy, ex, ey, degrees] = modifiers
  const [dy, dx] = [ey - sy, ex - sx]
  const halfWid = width / 2
  const dist = Math.sqrt(dy ** 2 + dx ** 2)
  const [xOff, yOff] = [(halfWid * dx) / dist, (halfWid * dy) / dist]

  return {
    type: Tree.POLYGON,
    erase: exposure === 0,
    points: (
      [
        [sx + xOff, sy - yOff],
        [ex + xOff, ey - yOff],
        [ex - xOff, ey + yOff],
        [sx - xOff, sy + yOff],
      ] as Tree.Position[]
    ).map(p => rotateAndShift(p, origin, degrees)),
  }
}

function plotCenterLine(
  origin: Tree.Position,
  modifiers: number[]
): Tree.ErasableShape {
  const [exposure, width, height, cx, cy, degrees] = modifiers
  const [halfWidth, halfHeight] = [width / 2, height / 2]

  return {
    type: Tree.POLYGON,
    erase: exposure === 0,
    points: (
      [
        [cx - halfWidth, cy - halfHeight],
        [cx + halfWidth, cy - halfHeight],
        [cx + halfWidth, cy + halfHeight],
        [cx - halfWidth, cy + halfHeight],
      ] as Tree.Position[]
    ).map(p => rotateAndShift(p, origin, degrees)),
  }
}

function plotOutline(
  origin: Tree.Position,
  modifiers: number[]
): Tree.ErasableShape {
  const [exposure, , ...coords] = modifiers.slice(0, -1)
  const degrees = modifiers[modifiers.length - 1]

  return {
    type: Tree.POLYGON,
    erase: exposure === 0,
    points: coords
      .flatMap<[number, number]>((coordinate, i) =>
        i % 2 === 1 ? [[coords[i - 1], coordinate]] : []
      )
      .map(p => rotateAndShift(p, origin, degrees)),
  }
}

function plotPolygon(
  origin: Tree.Position,
  modifiers: number[]
): Tree.ErasableShape {
  const [exposure, vertices, cx, cy, diameter, degrees] = modifiers
  const r = diameter / 2
  const step = (2 * PI) / vertices
  const points: Tree.Position[] = []
  let i

  for (i = 0; i < vertices; i++) {
    const theta = step * i
    const pointX = cx + r * Math.cos(theta)
    const pointY = cy + r * Math.sin(theta)
    points.push(rotateAndShift([pointX, pointY], origin, degrees))
  }

  return {type: Tree.POLYGON, erase: exposure === 0, points}
}

function plotMoire(
  origin: Tree.Position,
  modifiers: number[]
): Tree.ErasableShape[] {
  const rotate = (p: Tree.Position): Tree.Position =>
    rotateAndShift(p, origin, modifiers[8])

  const [cx0, cy0, d, ringThx, ringGap, ringN, lineThx, lineLength] = modifiers
  const [cx, cy] = rotate([cx0, cy0])
  const halfLineThx = lineThx / 2
  const halfLineLength = lineLength / 2

  const radii = []
  let count = 0
  let dRemain = d

  while (dRemain >= 0 && count < ringN) {
    const r = roundToPrecision(dRemain / 2)
    const rHole = roundToPrecision(r - ringThx)

    radii.push(r)
    if (rHole > 0) radii.push(rHole)
    count += 1
    dRemain = 2 * (rHole - ringGap)
  }

  return [
    {
      type: Tree.OUTLINE,
      segments: radii.flatMap(r => {
        return shapeToSegments({type: Tree.CIRCLE, cx, cy, r})
      }),
    },
    // Vertical stroke
    {
      type: Tree.POLYGON,
      points: (
        [
          [cx0 - halfLineThx, cy0 - halfLineLength],
          [cx0 + halfLineThx, cy0 - halfLineLength],
          [cx0 + halfLineThx, cy0 + halfLineLength],
          [cx0 - halfLineThx, cy0 + halfLineLength],
        ] as Tree.Position[]
      ).map(rotate),
    },
    // Horizontal stroke
    {
      type: Tree.POLYGON,
      points: (
        [
          [cx0 - halfLineLength, cy0 - halfLineThx],
          [cx0 + halfLineLength, cy0 - halfLineThx],
          [cx0 + halfLineLength, cy0 + halfLineThx],
          [cx0 - halfLineLength, cy0 + halfLineThx],
        ] as Tree.Position[]
      ).map(rotate),
    },
  ]
}

function plotThermal(
  origin: Tree.Position,
  modifiers: number[]
): Tree.ErasableShape {
  const [cx0, cy0, od, id, gap, degrees] = modifiers
  const center = rotateAndShift([cx0, cy0], origin, degrees)
  const [or, ir] = [od / 2, id / 2]
  const halfGap = gap / 2
  const oIntSquare = or ** 2 - halfGap ** 2
  const iIntSquare = ir ** 2 - halfGap ** 2
  const oInt = Math.sqrt(oIntSquare)
  const iInt = iIntSquare >= 0 ? Math.sqrt(iIntSquare) : halfGap
  const positions = [0, 90, 180, 270]
  const segments: Tree.PathSegment[] = []

  for (const rot of positions) {
    const points = (
      [
        [iInt, halfGap],
        [oInt, halfGap],
        [halfGap, oInt],
        [halfGap, iInt],
      ] as Tree.Position[]
    )
      .map(p => rotateAndShift(p, [cx0, cy0], rot))
      .map(p => rotateAndShift(p, origin, degrees))

    const [os, oe, oc] = getArcPositions(
      {x: points[1][0], y: points[1][1]},
      {x: points[2][0], y: points[2][0]},
      {x: center[0], y: center[1]},
      Tree.CCW
    )

    segments.push(
      {type: Tree.LINE, start: points[0], end: points[1]},
      {type: Tree.ARC, start: os, end: oe, center: oc, radius: or},
      {type: Tree.LINE, start: points[2], end: points[3]}
    )

    if (!positionsEqual(points[0], points[3])) {
      const [is, ie, ic] = getArcPositions(
        {x: points[3][0], y: points[3][1]},
        {x: points[0][0], y: points[0][1]},
        {x: center[0], y: center[1]},
        Tree.CW
      )
      segments.push({
        type: Tree.ARC,
        start: is,
        end: ie,
        center: ic,
        radius: ir,
      })
    }
  }

  return {type: Tree.OUTLINE, segments}
}
