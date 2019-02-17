import React, {useState, useRef, useEffect, useLayoutEffect} from 'react'
import cx from 'classnames'

import {useAppState} from '../state'
import {Fade, Slide, SvgRender} from '../ui'
import {INITIAL_STATE, pan, zoom, getScale} from './display'
import PanZoom from './PanZoom'
import Controls from './Controls'
import LayersRender from './LayersRender'
import {DisplayControllerProps} from './types'

const percent = (n: number): string => `${n * 100}%`

export default function BoardDisplay(): JSX.Element {
  const {mode, board, loading, layerVisibility} = useAppState()
  const [displayState, setDisplayState] = useState(INITIAL_STATE)
  const prevBoardId = useRef<string | null>(null)
  const containerRef = useRef<HTMLDivElement | null>(null)
  const show = !loading && board !== null

  const controllerProps: DisplayControllerProps = {
    step: displayState.step,
    reset: () => setDisplayState(INITIAL_STATE),
    pan: (...args) => setDisplayState(pan(displayState, ...args)),
    zoom: (...args) => setDisplayState(zoom(displayState, ...args)),
    zoomIn: () => setDisplayState(zoom(displayState, 1)),
    zoomOut: () => setDisplayState(zoom(displayState, -1)),
  }

  useLayoutEffect(() => {
    if (containerRef.current) {
      const {x, y, step} = displayState
      const {scale} = getScale(step)
      const transform = `translate(${percent(x)},${percent(y)}) scale(${scale})`

      containerRef.current.style.transform = transform
    }
  })

  useEffect(() => {
    const currId = board ? board.id : null
    const prevId = prevBoardId.current

    if ((prevId || currId) && prevId !== currId) controllerProps.reset()
  }, [board, prevBoardId.current])

  useEffect(() => {
    prevBoardId.current = board ? board.id : null
  }, [board])

  return (
    <>
      <Fade in={show}>
        <PanZoom {...controllerProps} containerRef={containerRef}>
          {board && (
            <>
              <SvgRender
                className={cx('w-100', {dn: mode !== 'top'})}
                source={board.top}
              />
              <SvgRender
                className={cx('w-100', {dn: mode !== 'bottom'})}
                source={board.bottom}
              />
              <LayersRender
                className={cx('w-100', {dn: mode !== 'layers'})}
                viewBox={board.viewBox}
                layers={board.layers}
                layerVisibility={layerVisibility}
              />
            </>
          )}
        </PanZoom>
      </Fade>
      <Slide in={show} from="bottom">
        <Controls {...controllerProps} />
      </Slide>
    </>
  )
}
