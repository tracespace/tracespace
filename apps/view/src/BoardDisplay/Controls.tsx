// board display controls for zoom bar and board vs layer render
import React from 'react'

import {Button, Icon} from '../ui'
import {linearizeScale} from './display'
import {DisplayControllerProps} from './types'

type Props = DisplayControllerProps

const ZOOM_RESET_TOOLTIP = 'Reset pan and zoom'
const ZOOM_OUT_TOOLTIP = 'Zoom out'
const ZOOM_IN_TOOTIP = 'Zoom in'

const CONTROLS_STYLE =
  'absolute absolute--center-w-third bottom-1 z-1 w-third flex items-center f5'
const ZOOM_ICON_STYLE = 'flex-none'
const ZOOM_RESET_STYLE = 'absolute bottom-2 left-50 tf-center-x'

const ZOOM_BAR_CONTAINER_STYLE = 'relative w-100 flex'
const ZOOM_BAR_STYLE = 'dib pt2 bg-white shadow w-100'
const ZOOM_SLIDER_STYLE =
  'absolute w1 h1 top-50 tf-center bg-brand o-70 left-animate'

export default function Controls(props: Props): JSX.Element {
  const {step, reset, zoomIn, zoomOut} = props
  const sliderLeft = `${linearizeScale(step) * 100}%`

  return (
    <div className={CONTROLS_STYLE}>
      <Button
        className={ZOOM_RESET_STYLE}
        onClick={reset}
        title={ZOOM_RESET_TOOLTIP}
      >
        <Icon name="expand" />
      </Button>
      <Button
        className={ZOOM_ICON_STYLE}
        onClick={zoomOut}
        title={ZOOM_OUT_TOOLTIP}
      >
        <Icon name="search-minus" />
      </Button>
      <span className={ZOOM_BAR_CONTAINER_STYLE}>
        <span className={ZOOM_BAR_STYLE} />
        <span className={ZOOM_SLIDER_STYLE} style={{left: sliderLeft}} />
      </span>
      <Button
        className={ZOOM_ICON_STYLE}
        onClick={zoomIn}
        title={ZOOM_IN_TOOTIP}
      >
        <Icon name="search-plus" />
      </Button>
    </div>
  )
}
