// Mathematical procedures
import {Position} from '../types'

const PRECISION = 10_000_000_000

export const {PI} = Math
export const HALF_PI = PI / 2
export const THREE_HALF_PI = 3 * HALF_PI
export const TWO_PI = 2 * PI

export const limitAngle = (theta: number): number => {
  if (theta >= 0 && theta <= TWO_PI) return theta
  if (theta < 0) return theta + TWO_PI
  if (theta > TWO_PI) return theta - TWO_PI
  return limitAngle(theta)
}

export const rotateQuadrant = (theta: number): number =>
  theta >= HALF_PI ? theta - HALF_PI : theta + THREE_HALF_PI

export const degreesToRadians = (degrees: number): number =>
  (degrees * Math.PI) / 180

export function rotateAndShift(
  point: Position,
  shift: Position,
  degrees = 0
): Position {
  const rotation = degreesToRadians(degrees)
  const [sin, cos] = [Math.sin(rotation), Math.cos(rotation)]
  const [x, y] = point

  return [
    roundToPrecision(x * cos - y * sin + shift[0]),
    roundToPrecision(x * sin + y * cos + shift[1]),
  ]
}

// Avoid weird floating point rounding stuff
export function roundToPrecision(n: number): number {
  const rounded = Math.round(n * PRECISION) / PRECISION

  // Remove -0 for ease
  return rounded === 0 ? 0 : rounded
}

export const positionsEqual = (a: number[], b: number[]): boolean => {
  const [ax, ay, bx, by] = [a[0], a[1], b[0], b[1]].map(roundToPrecision)
  return ax === bx && ay === by
}
