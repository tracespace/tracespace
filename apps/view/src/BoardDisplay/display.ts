// scale constants and utilities
import {DisplayState} from './types'

export const SCALE_INITIAL = 0.5
export const SCALE_LIMIT_FACTOR = 40
export const SCALE_STEP_COUNT = 16

export const SCALE_MIN = SCALE_INITIAL / SCALE_LIMIT_FACTOR
export const SCALE_MAX = SCALE_INITIAL * SCALE_LIMIT_FACTOR

export const INITIAL_STATE: DisplayState = {
  x: 0,
  y: 0,
  step: SCALE_STEP_COUNT / 2,
}

const SCALE_MIN_LOG = Math.log(SCALE_MIN)
const SCALE_MAX_LOG = Math.log(SCALE_MAX)
const SCALE_RANGE_LOG = SCALE_MAX_LOG - SCALE_MIN_LOG
const SCALE_STEP_LOG = SCALE_RANGE_LOG / SCALE_STEP_COUNT

export const SCALE_STEPS = new Array(SCALE_STEP_COUNT + 1)
  .fill(0)
  .map((_, i) => Math.pow(Math.E, SCALE_MIN_LOG + SCALE_STEP_LOG * i))

// TODO(mc, 2018-11-20): find the notebook where I did this math and
// put it in a README in this directory
export function zoom(
  prevState: DisplayState,
  delta: number,
  centerX: number = 0.5,
  centerY: number = 0.5
): DisplayState {
  const {x: prevX, y: prevY, step: prevStep} = prevState
  const {scale: prevScale} = getScale(prevStep)
  const {step: nextStep, scale: nextScale} = getScale(prevStep + delta)
  const scaleRatio = nextScale / prevScale

  return {
    step: nextStep,
    x: prevX + (scaleRatio - 1) * (prevX - centerX + 0.5),
    y: prevY + (scaleRatio - 1) * (prevY - centerY + 0.5),
  }
}

export function pan(
  prevState: DisplayState,
  deltaX: number,
  deltaY: number
): DisplayState {
  return {
    ...prevState,
    x: prevState.x + deltaX,
    y: prevState.y + deltaY,
  }
}

export function getScale(step: number): {step: number; scale: number} {
  step = Math.round(step)
  step = Math.max(0, step)
  step = Math.min(SCALE_STEP_COUNT, step)

  return {step: step, scale: SCALE_STEPS[step]}
}

// take a logarithmic value and return it on a linear scale where:
//   0.0 -> scale === SCALE_MIN
//   0.5 -> scale === SCALE_INITIAL
//   1.0 -> SCALE === SCALE_MAX
export function linearizeScale(step: number): number {
  const {step: actualStep} = getScale(step)

  return actualStep / SCALE_STEP_COUNT
}
