export type DisplayState = {
  x: number
  y: number
  step: number
}

export type Point = {
  x: number
  y: number
}

export type PartialDisplayState<
  K extends keyof DisplayState = keyof DisplayState
> = Pick<DisplayState, K>

export type UpdateDisplayState = (partial: PartialDisplayState) => void

export type HandleZoom = (
  delta: number,
  centerX: number,
  centerY: number
) => void

export type HandlePan = (deltaX: number, deltaY: number) => void

export type DisplayControllerProps = {
  step: DisplayState['step']
  pan: HandlePan
  zoom: HandleZoom
  zoomIn: () => void
  zoomOut: () => void
  reset: () => void
}
