import {useRef, useEffect} from 'preact/hooks'
import type {Ref} from 'preact/hooks'

export interface PanZoomOptions {
  initialScale?: number
  minScale?: number
  maxScale?: number
  onChange?: (state: PanZoomState) => unknown
}

export type PanZoomState = [scale: number, panX: number, panY: number]

export type PanZoom = [ref: Ref<SVGGElement>, zoom?: PanZoomer]

export function usePanZoom(options: PanZoomOptions = {}): PanZoom {
  const viewportRef = useRef<SVGGElement>(null)
  const panZoomerRef = useRef<PanZoomer>()

  useEffect(() => {
    if (viewportRef.current !== null) {
      const [cleanup, panZoomer] = initializePanZoom(
        viewportRef.current,
        options
      )
      panZoomerRef.current = panZoomer
      return cleanup
    }
  }, [])

  return [viewportRef, panZoomerRef.current]
}

interface PanZoomer {
  container: SVGSVGElement
  options: PanZoomOptions
  state: PanZoomState
  create(container: SVGSVGElement, options: PanZoomOptions): PanZoomer
  reset(): void
  pan(deltaX: number, deltaY: number): void
  zoom(deltaZ: number, centerX?: number, centerY?: number): void
  zoomTo(scale: number, centerX?: number, centerY?: number): void
}

const PanZoomerPrototype: PanZoomer = {
  container: undefined as unknown as SVGSVGElement,
  options: undefined as unknown as PanZoomOptions,
  state: undefined as unknown as PanZoomState,

  create(container: SVGSVGElement, options: PanZoomOptions): PanZoomer {
    const panZoomer = Object.assign(Object.create(PanZoomerPrototype), {
      container,
      options,
      state: [1, 0, 0],
    })

    return panZoomer.reset()
  },

  reset(): PanZoomer {
    const initialScale = this.options.initialScale ?? 1
    const initialPanX = 0.5 * this.container.clientWidth * (1 - initialScale)
    const initialPanY = 0.5 * this.container.clientHeight * (1 - initialScale)
    const state = [initialScale, initialPanX, initialPanY]

    Object.assign(this, {state})
    this.options.onChange?.(this.state)
    return this
  },

  pan(deltaX: number, deltaY: number): void {
    this.state[1] += deltaX
    this.state[2] += deltaY

    this.options.onChange?.(this.state)
  },

  zoom(deltaZ: number, centerX?: number, centerY?: number): void {
    const [scale] = this.state
    this.zoomTo(scale * (1 - deltaZ), centerX, centerY)
  },

  zoomTo(scale: number, centerX?: number, centerY?: number): void {
    centerX = centerX ?? 0.5 * this.container.clientWidth
    centerY = centerY ?? 0.5 * this.container.clientHeight

    const [previousScale, panX, panY] = this.state
    const nextScale = clamp(scale, this.options.minScale, this.options.maxScale)

    const zoom = nextScale / previousScale
    const originX = centerX - panX
    const originY = centerY - panY

    this.state[0] = nextScale
    this.state[1] += originX * (1 - zoom)
    this.state[2] += originY * (1 - zoom)

    this.options.onChange?.(this.state)
  },
}

function initializePanZoom(
  viewport: SVGGElement,
  options: PanZoomOptions
): [cleanup: () => void, panZoomer: PanZoomer] {
  const updateViewport = throttle((state: PanZoomState) => {
    const [scale, panX, panY] = state
    viewport.style.transform = `translate(${panX}px,${panY}px) scale(${scale})`
    options.onChange?.([scale, panX, panY])
  })

  const container = viewport.parentElement as unknown as SVGSVGElement
  const panZoomer = PanZoomerPrototype.create(container, {
    ...options,
    onChange: updateViewport,
  })

  let mouseLocation: [x: number, y: number] | undefined

  const handleMouseDown = (event: MouseEvent) => {
    // eslint-disable-next-line no-bitwise
    if ((event.buttons & 1) === 1) {
      mouseLocation = [event.clientX, event.clientY]
    }
  }

  const handleMouseUp = () => {
    mouseLocation = undefined
  }

  const handleMouseMove = throttle((event: MouseEvent) => {
    if (mouseLocation !== undefined) {
      const movementX = event.clientX - mouseLocation[0]
      const movementY = event.clientY - mouseLocation[1]

      mouseLocation[0] = event.clientX
      mouseLocation[1] = event.clientY
      panZoomer.pan(movementX, movementY)
    }
  })

  const handleWheel = (event: WheelEvent) => {
    panZoomer.zoom(event.deltaY / 1000, event.clientX, event.clientY)
    event.preventDefault()
  }

  const cleanup = () => {
    updateViewport.cancel()
    handleMouseMove.cancel()
    container.removeEventListener('mousedown', handleMouseDown)
    container.removeEventListener('mouseenter', handleMouseDown)
    container.removeEventListener('mouseup', handleMouseUp)
    container.removeEventListener('mouseleave', handleMouseUp)
    container.removeEventListener('mousemove', handleMouseMove)
    container.removeEventListener('wheel', handleWheel)
  }

  container.addEventListener('mousedown', handleMouseDown, {passive: true})
  container.addEventListener('mouseenter', handleMouseDown, {passive: true})
  container.addEventListener('mouseup', handleMouseUp, {passive: true})
  container.addEventListener('mouseleave', handleMouseUp, {passive: true})
  container.addEventListener('mousemove', handleMouseMove, {passive: true})
  container.addEventListener('wheel', handleWheel, {passive: false})

  return [cleanup, panZoomer]
}

export type Callback<A extends any[]> = (...args: A) => void

export interface ThrottledCallback<A extends any[]> extends Callback<A> {
  cancel: () => void
}

function throttle<ArgsType extends any[]>(
  callback: Callback<ArgsType>
): ThrottledCallback<ArgsType> {
  let requestId: number | undefined
  let latestArgs: ArgsType | undefined

  return Object.assign(throttledCallback, {cancel})

  function throttledCallback(...args: ArgsType): void {
    latestArgs = args

    if (requestId === undefined) {
      requestId = requestAnimationFrame(doCallback)
    }
  }

  function doCallback() {
    if (latestArgs !== undefined) {
      callback(...latestArgs)
      requestId = undefined
      latestArgs = undefined
    }
  }

  function cancel() {
    if (requestId !== undefined) {
      cancelAnimationFrame(requestId)
      requestId = undefined
    }
  }
}

function clamp(
  value: number,
  min: number | undefined,
  max: number | undefined
): number {
  if (min !== undefined && value < min) return min
  if (max !== undefined && value > max) return max
  return value
}
