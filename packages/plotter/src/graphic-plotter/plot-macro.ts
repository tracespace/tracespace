// Plot a tool macro as shapes
import type {MacroPrimitiveCode, MacroValue} from '@tracespace/parser'
import {
  MACRO_VARIABLE,
  MACRO_PRIMITIVE,
  MACRO_CIRCLE,
  MACRO_VECTOR_LINE_DEPRECATED,
  MACRO_VECTOR_LINE,
  MACRO_CENTER_LINE,
  MACRO_LOWER_LEFT_LINE_DEPRECATED,
  MACRO_OUTLINE,
  MACRO_POLYGON,
  MACRO_MOIRE_DEPRECATED,
  MACRO_THERMAL,
} from '@tracespace/parser'

import {PI, rotateAndShift, positionsEqual} from '../coordinate-math'

import * as Tree from '../tree'
import type {MacroTool} from '../tool-store'
import type {Location} from '../location-store'

import {CW, CCW, getArcPositions} from './plot-path'

type VariableValues = Record<string, number>

export function plotMacro(
  tool: MacroTool,
  location: Location
): Tree.LayeredShape {
  const shapes: Tree.ErasableShape[] = []
  const variableValues: VariableValues = Object.fromEntries(
    tool.variableValues.map((value, index) => [`$${index + 1}`, value])
  )

  for (const block of tool.macro) {
    if (block.type === MACRO_VARIABLE) {
      variableValues[block.name] = solveExpression(block.value, variableValues)
    }

    if (block.type === MACRO_PRIMITIVE) {
      const origin: Tree.Position = [location.endPoint.x, location.endPoint.y]
      const parameters = block.parameters.map(p => {
        return solveExpression(p, variableValues)
      })

      shapes.push(...plotPrimitive(block.code, origin, parameters))
    }
  }

  return {type: Tree.LAYERED_SHAPE, shapes}
}

function solveExpression(
  expression: MacroValue,
  variables: VariableValues
): number {
  if (typeof expression === 'number') return expression
  if (typeof expression === 'string') return variables[expression]

  const left = solveExpression(expression.left, variables)
  const right = solveExpression(expression.right, variables)

  switch (expression.operator) {
    case '+': {
      return left + right
    }

    case '-': {
      return left - right
    }

    case 'x': {
      return left * right
    }

    case '/': {
      return left / right
    }
  }
}

function plotPrimitive(
  code: MacroPrimitiveCode,
  origin: Tree.Position,
  parameters: number[]
): Tree.ErasableShape[] {
  switch (code) {
    case MACRO_CIRCLE: {
      return [plotCircle(origin, parameters)]
    }

    case MACRO_VECTOR_LINE:
    case MACRO_VECTOR_LINE_DEPRECATED: {
      return [plotVectorLine(origin, parameters)]
    }

    case MACRO_CENTER_LINE: {
      return [plotCenterLine(origin, parameters)]
    }

    case MACRO_LOWER_LEFT_LINE_DEPRECATED: {
      return [plotLowerLeftLine(origin, parameters)]
    }

    case MACRO_OUTLINE: {
      return [plotOutline(origin, parameters)]
    }

    case MACRO_POLYGON: {
      return [plotPolygon(origin, parameters)]
    }

    case MACRO_MOIRE_DEPRECATED: {
      return plotMoire(origin, parameters)
    }

    case MACRO_THERMAL: {
      return [plotThermal(origin, parameters)]
    }
  }

  return []
}

function plotCircle(
  origin: Tree.Position,
  parameters: number[]
): Tree.ErasableShape {
  const [exposure, diameter, cx0, cy0, degrees] = parameters
  const r = diameter / 2
  const [cx, cy] = rotateAndShift([cx0, cy0], origin, degrees)

  return {type: Tree.CIRCLE, erase: exposure === 0, cx, cy, r}
}

function plotVectorLine(
  origin: Tree.Position,
  parameters: number[]
): Tree.ErasableShape {
  const [exposure, width, sx, sy, ex, ey, degrees] = parameters
  const [dy, dx] = [ey - sy, ex - sx]
  const halfWidth = width / 2
  const distance = Math.sqrt(dy ** 2 + dx ** 2)
  const [xOff, yOff] = [
    (halfWidth * dy) / distance,
    (halfWidth * dx) / distance,
  ]

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
  parameters: number[]
): Tree.ErasableShape {
  const [exposure, width, height, cx, cy, degrees] = parameters
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

function plotLowerLeftLine(
  origin: Tree.Position,
  parameters: number[]
): Tree.ErasableShape {
  const [exposure, width, height, x, y, degrees] = parameters

  return {
    type: Tree.POLYGON,
    erase: exposure === 0,
    points: (
      [
        [x, y],
        [x + width, y],
        [x + width, y + height],
        [x, y + height],
      ] as Tree.Position[]
    ).map(p => rotateAndShift(p, origin, degrees)),
  }
}

function plotOutline(
  origin: Tree.Position,
  parameters: number[]
): Tree.ErasableShape {
  const [exposure, , ...coords] = parameters.slice(0, -1)
  const degrees = parameters[parameters.length - 1]

  return {
    type: Tree.POLYGON,
    erase: exposure === 0,
    points: coords
      .flatMap<[number, number]>((coordinate, index) =>
        index % 2 === 1 ? [[coords[index - 1], coordinate]] : []
      )
      .map(p => rotateAndShift(p, origin, degrees)),
  }
}

function plotPolygon(
  origin: Tree.Position,
  parameters: number[]
): Tree.ErasableShape {
  const [exposure, vertices, cx, cy, diameter, degrees] = parameters
  const r = diameter / 2
  const step = (2 * PI) / vertices
  const points: Tree.Position[] = []
  let index

  for (index = 0; index < vertices; index++) {
    const theta = step * index
    const pointX = cx + r * Math.cos(theta)
    const pointY = cy + r * Math.sin(theta)
    points.push(rotateAndShift([pointX, pointY], origin, degrees))
  }

  return {type: Tree.POLYGON, erase: exposure === 0, points}
}

function plotMoire(
  origin: Tree.Position,
  parameters: number[]
): Tree.ErasableShape[] {
  const rotate = (p: Tree.Position): Tree.Position =>
    rotateAndShift(p, origin, parameters[8])

  const [cx0, cy0, d, ringThx, ringGap, ringN, lineThx, lineLength] = parameters
  const [cx, cy] = rotate([cx0, cy0])
  const halfLineThx = lineThx / 2
  const halfLineLength = lineLength / 2

  const radii: Array<{r: number; erase: boolean}> = []
  let count = 0
  let dRemain = d

  while (dRemain >= 0 && count < ringN) {
    const r = dRemain / 2
    const rHole = r - ringThx

    radii.push({r, erase: false})
    if (rHole > 0) radii.push({r: rHole, erase: true})
    count += 1
    dRemain = 2 * (rHole - ringGap)
  }

  return [
    ...radii.flatMap(({r, erase}) => {
      return {type: Tree.CIRCLE, cx, cy, r, erase} as Tree.CircleShape
    }),

    // Vertical stroke
    {
      type: Tree.POLYGON,
      erase: false,
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
      erase: false,
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
  parameters: number[]
): Tree.ErasableShape {
  const [cx0, cy0, od, id, gap, degrees] = parameters
  const center = rotateAndShift([cx0, cy0], origin, degrees)
  const [or, ir] = [od / 2, id / 2]
  const halfGap = gap / 2
  const outerIntSquare = or ** 2 - halfGap ** 2
  const innerIntSquare = ir ** 2 - halfGap ** 2
  const outerInt = Math.sqrt(outerIntSquare)
  const innerInt = innerIntSquare >= 0 ? Math.sqrt(innerIntSquare) : halfGap
  const positions = [0, 90, 180, 270]
  const segments: Tree.PathSegment[] = []

  for (const rot of positions) {
    const points = (
      [
        [innerInt, halfGap],
        [outerInt, halfGap],
        [halfGap, outerInt],
        [halfGap, innerInt],
      ] as Tree.Position[]
    )
      .map(p => rotateAndShift(p, [cx0, cy0], rot))
      .map(p => rotateAndShift(p, origin, degrees))

    const [os, oe, oc] = getArcPositions(
      {x: points[1][0], y: points[1][1]},
      {x: points[2][0], y: points[2][1]},
      {x: center[0], y: center[1]},
      CCW
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
        CW
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
