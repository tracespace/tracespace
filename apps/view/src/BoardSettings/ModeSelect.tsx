import React from 'react'
import cx from 'classnames'

import {useAppState, setMode} from '../state'
import {Button} from '../ui'

const STYLE = 'mt2'
const BUTTON_STYLE = 'dib tc'
const TEXT_STYLE = 'db w3 mt2 mh2 mb1 bw2 bb'
const DESELECTED_STYLE = 'b--transparent'
const SELECTED_STYLE = 'b--brand'

export default function ModeSelect(): JSX.Element | null {
  const {mode, dispatch} = useAppState()

  if (!mode) return null

  const buttons = [
    {mode: 'layers', onClick: () => dispatch(setMode('layers'))},
    {mode: 'top', onClick: () => dispatch(setMode('top'))},
    {mode: 'bottom', onClick: () => dispatch(setMode('bottom'))},
  ]

  return (
    <div className={STYLE}>
      {buttons.map(b => (
        <Button key={b.mode} className={BUTTON_STYLE} onClick={b.onClick}>
          <span
            className={cx(
              TEXT_STYLE,
              mode === b.mode ? SELECTED_STYLE : DESELECTED_STYLE
            )}
          >
            {b.mode}
          </span>
        </Button>
      ))}
    </div>
  )
}
