// Mathematical procedures
import type {Position} from './tree'

export const {PI} = Math
export const HALF_PI = PI / 2
export const THREE_HALF_PI = 3 * HALF_PI
export const TWO_PI = 2 * PI

export function limitAngle(theta: number): number {
  if (theta >= 0 && theta <= TWO_PI) return theta
  if (theta < 0) return theta + TWO_PI
  if (theta > TWO_PI) return theta - TWO_PI
  return limitAngle(theta)
}

export function rotateQuadrant(theta: number): number {
  return theta >= HALF_PI ? theta - HALF_PI : theta + THREE_HALF_PI
}

export function degreesToRadians(degrees: number): number {
  return (degrees * Math.PI) / 180
}

export function rotateAndShift(
  point: Position,
  shift: Position,
  degrees = 0
): Position {
  const rotation = degreesToRadians(degrees)
  const [sin, cos] = [Math.sin(rotation), Math.cos(rotation)]
  const [x, y] = point
  const nextX = x * cos - y * sin + shift[0]
  const nextY = x * sin + y * cos + shift[1]

  return [nextX, nextY]
}

export function positionsEqual(a: number[], b: number[]): boolean {
  return a[0] === b[0] && a[1] === b[1]
}
