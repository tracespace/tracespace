import React from 'react'
import contrast from 'contrast'
import {SIDE_TOP, SIDE_BOTTOM, SIDE_ALL, GerberSide} from 'whats-that-gerber'

import {LayerRender} from '../types'
import {useAppState, toggleVisibility, State} from '../state'
import {Button, Icon, IconProps} from '../ui'

type Props = {
  className: string
  id: LayerRender['id']
  side: LayerRender['side']
  type: LayerRender['type']
  converter: LayerRender['converter']
  color: LayerRender['color']
}

const TOP_SIDES: Array<GerberSide> = [SIDE_TOP, SIDE_ALL]
const BOTTOM_SIDES: Array<GerberSide> = [SIDE_BOTTOM, SIDE_ALL]
const TOOLTIP = 'Toggle layer visibility (shift+click to toggle other layers)'
const BOARD_MODE_TOOLTIP = 'Cannot change visibility in board mode'
const NO_RENDER_TOOLTIP = 'Unable to render file'

const layerVisible = (
  mode: State['mode'],
  type: LayerRender['type'],
  side: LayerRender['side'],
  converter: LayerRender['converter'],
  layerVisibility: boolean
): boolean =>
  type !== null &&
  converter.layer.length !== 0 &&
  ((mode === 'layers' && layerVisibility) ||
    (mode === 'top' && TOP_SIDES.includes(side)) ||
    (mode === 'bottom' && BOTTOM_SIDES.includes(side)))

const layerTooltip = (mode: State['mode'], disabled: boolean): string => {
  if (mode !== 'layers') return BOARD_MODE_TOOLTIP
  if (disabled) return NO_RENDER_TOOLTIP
  return TOOLTIP
}

export default function VisibilityButton(props: Props): JSX.Element {
  const {mode, layerVisibility, dispatch} = useAppState()
  const {id, side, type, converter, color, className} = props

  const disabled =
    type === null || converter.layer.length === 0 || mode !== 'layers'
  const visible = layerVisible(mode, type, side, converter, layerVisibility[id])
  const tooltip = layerTooltip(mode, disabled)
  const iconProps: IconProps = {name: visible ? 'eye' : 'eye-slash'}

  if (mode === 'layers' && visible) {
    iconProps.style = {
      backgroundColor: color,
      color: contrast(color) === 'dark' ? 'white' : 'currentColor',
    }
  }

  return (
    <Button
      className={className}
      title={tooltip}
      disabled={disabled}
      onClick={event => dispatch(toggleVisibility(id, event.shiftKey))}
    >
      <Icon {...iconProps} />
    </Button>
  )
}
