// Plot a tool macro as shapes
import * as Parser from '@tracespace/parser'
import * as Tree from '../tree'
import {Position} from '../tree'
import * as Geo from './geometry'
import {rotateAndShift, roundToPrecision, positionsEqual, PI} from './math'
import {getCenterAngles} from './arc-segment'

type ParametersMap = Record<string, number>

export function plotMacro(
  macro: Parser.ToolMacro,
  parameters: number[],
  origin: Position
): Tree.LayeredShape {
  const shapes: Tree.Shape[] = []
  const parameterMap = Object.fromEntries(
    parameters.map((value, i) => [`$${i + 1}`, value])
  )

  for (const block of macro.children) {
    if (block.type === Parser.MACRO_VARIABLE) {
      parameterMap[block.name] = solveExpression(block.value, parameterMap)
    } else if (block.type === Parser.MACRO_PRIMITIVE) {
      const mods = block.modifiers.map(m => solveExpression(m, parameterMap))
      const shape = plotPrimitive(block.code, origin, mods)

      if (shape !== null) shapes.push(shape)
    }
  }

  return Geo.layeredShape({shapes})
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
  origin: Position,
  modifiers: number[]
): Tree.Shape | null {
  switch (code) {
    case Parser.MACRO_CIRCLE: {
      return plotCircle(origin, modifiers)
    }

    case Parser.MACRO_VECTOR_LINE: {
      return plotVectorLine(origin, modifiers)
    }

    case Parser.MACRO_CENTER_LINE: {
      return plotCenterLine(origin, modifiers)
    }

    case Parser.MACRO_OUTLINE: {
      return plotOutline(origin, modifiers)
    }

    case Parser.MACRO_POLYGON: {
      return plotPolygon(origin, modifiers)
    }

    case Parser.MACRO_MOIRE: {
      return plotMoire(origin, modifiers)
    }

    case Parser.MACRO_THERMAL: {
      return plotThermal(origin, modifiers)
    }
  }

  return null
}

function plotCircle(origin: Position, modifiers: number[]): Tree.Shape {
  const [exposure, diameter, cx0, cy0, degrees] = modifiers
  const r = diameter / 2
  const [cx, cy] = rotateAndShift([cx0, cy0], origin, degrees)
  const circle = Geo.circle({cx, cy, r})

  return exposure === 1
    ? circle
    : Geo.clearOutline({segments: Geo.shapeToSegments(circle)})
}

function plotVectorLine(origin: Position, modifiers: number[]): Tree.Shape {
  const [exposure, width, sx, sy, ex, ey, degrees] = modifiers
  const [dy, dx] = [ey - sy, ex - sx]
  const halfWid = width / 2
  const dist = Math.sqrt(dy ** 2 + dx ** 2)
  const [xOff, yOff] = [(halfWid * dx) / dist, (halfWid * dy) / dist]
  const polygon = Geo.polygon({
    points: (
      [
        [sx + xOff, sy - yOff],
        [ex + xOff, ey - yOff],
        [ex - xOff, ey + yOff],
        [sx - xOff, sy + yOff],
      ] as Position[]
    ).map(p => rotateAndShift(p, origin, degrees)),
  })

  return exposure === 1
    ? polygon
    : Geo.clearOutline({segments: Geo.shapeToSegments(polygon)})
}

function plotCenterLine(origin: Position, modifiers: number[]): Tree.Shape {
  const [exposure, width, height, cx, cy, degrees] = modifiers
  const [halfWidth, halfHeight] = [width / 2, height / 2]
  const polygon = Geo.polygon({
    points: (
      [
        [cx - halfWidth, cy - halfHeight],
        [cx + halfWidth, cy - halfHeight],
        [cx + halfWidth, cy + halfHeight],
        [cx - halfWidth, cy + halfHeight],
      ] as Position[]
    ).map(p => rotateAndShift(p, origin, degrees)),
  })

  return exposure === 1
    ? polygon
    : Geo.clearOutline({segments: Geo.shapeToSegments(polygon)})
}

function plotOutline(origin: Position, modifiers: number[]): Tree.Shape {
  const [exposure, , ...coords] = modifiers.slice(0, -1)
  const degrees = modifiers[modifiers.length - 1]
  const polygon = Geo.polygon({
    points: coords
      .flatMap<[number, number]>((coordinate, i) =>
        i % 2 === 1 ? [[coords[i - 1], coordinate]] : []
      )
      .map(p => rotateAndShift(p, origin, degrees)),
  })

  return exposure === 1
    ? polygon
    : Geo.clearOutline({segments: Geo.shapeToSegments(polygon)})
}

function plotPolygon(origin: Position, modifiers: number[]): Tree.Shape {
  const [exposure, vertices, cx, cy, diameter, degrees] = modifiers
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

  const polygon = Geo.polygon({points})

  return exposure === 1
    ? polygon
    : Geo.clearOutline({segments: Geo.shapeToSegments(polygon)})
}

function plotMoire(origin: Position, modifiers: number[]): Tree.Shape {
  const rotate = (p: Position): Position =>
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

  const moireShapes: Tree.SimpleShape[] = [
    Geo.outline({
      segments: radii.flatMap(r =>
        Geo.shapeToSegments(Geo.circle({cx, cy, r}))
      ),
    }),
    // Vertical stroke
    Geo.polygon({
      points: (
        [
          [cx0 - halfLineThx, cy0 - halfLineLength],
          [cx0 + halfLineThx, cy0 - halfLineLength],
          [cx0 + halfLineThx, cy0 + halfLineLength],
          [cx0 - halfLineThx, cy0 + halfLineLength],
        ] as Position[]
      ).map(rotate),
    }),
    // Horizontal stroke
    Geo.polygon({
      points: (
        [
          [cx0 - halfLineLength, cy0 - halfLineThx],
          [cx0 + halfLineLength, cy0 - halfLineThx],
          [cx0 + halfLineLength, cy0 + halfLineThx],
          [cx0 - halfLineLength, cy0 + halfLineThx],
        ] as Position[]
      ).map(rotate),
    }),
  ]

  return Geo.layeredShape({shapes: moireShapes})
}

function plotThermal(origin: Position, modifiers: number[]): Tree.Shape {
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
      ] as Position[]
    )
      .map(p => rotateAndShift(p, [cx0, cy0], rot))
      .map(p => rotateAndShift(p, origin, degrees))

    const [os, oe, , oSweep] = getCenterAngles(
      points[1],
      points[2],
      center,
      Tree.CCW
    )

    segments.push(
      Geo.line({start: points[0], end: points[1]}),
      Geo.arc({
        start: os,
        end: oe,
        center,
        radius: or,
        sweep: oSweep,
        direction: Tree.CCW,
      }),
      Geo.line({start: points[2], end: points[3]})
    )

    if (!positionsEqual(points[0], points[3])) {
      const [is, ie, , iSweep] = getCenterAngles(
        points[3],
        points[0],
        center,
        Tree.CW
      )

      segments.push(
        Geo.arc({
          start: is,
          end: ie,
          center,
          radius: ir,
          sweep: iSweep,
          direction: Tree.CW,
        })
      )
    }
  }

  return Geo.outline({segments})
}
