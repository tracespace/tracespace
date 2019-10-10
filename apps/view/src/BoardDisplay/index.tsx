import React, {useState, useRef, useEffect, useLayoutEffect} from 'react'
import cx from 'classnames'

import {useAppState} from '../state'
import {usePrevious} from '../hooks'
import {Fade, Slide, SvgRender} from '../ui'
import {INITIAL_STATE, pan, zoom, getScale} from './display'
import PanZoom from './PanZoom'
import Controls from './Controls'
import LayersRender from './LayersRender'
import {DisplayControllerProps} from './types'

const percent = (n: number): string => `${n * 100}%`
const getId = (b: {id: string} | null): string | null => (b ? b.id : null)

export default function BoardDisplay(): JSX.Element {
  const {mode, board, loading, layerVisibility} = useAppState()
  const [displayState, setDisplayState] = useState(INITIAL_STATE)
  const prevBoard = usePrevious(board)
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
    if (getId(board) !== getId(prevBoard)) controllerProps.reset()
  }, [board, prevBoard])

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
                className={cx('w-100', {clip: mode !== 'layers'})}
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
