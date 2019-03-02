import React, {useState} from 'react'
import cx from 'classnames'

import {useWindowListener} from '../../hooks'
import {stopPropagation} from '../../events'
import {Icon} from '../Icon'

export type DeleteButtonProps = {
  className?: string
  onClick: () => void
}

const DELETE_ICON = 'trash-alt'
const DELETE_COPY = 'delete?'

const STYLE = 'flex items-center bn pa0 br2 pointer c-animate overflow-hidden'
const ARMED_STYLE = 'white bg-red hover-bg-dark-red'
const DISARMED_STYLE = 'red bg-white hover-bg-black-20'

const WRAPPER_STYLE = 'flex-none mw-animate overflow-hidden'
const WRAPPER_ARMED_STYLE = 'mw4'
const WRAPPER_DISARMED_STYLE = 'mw0'

const COPY_STYLE = 'dib pl1 pr2'

export function DeleteButton(props: DeleteButtonProps): JSX.Element {
  const [armed, setArmed] = useState(false)
  const className = cx(
    STYLE,
    armed ? ARMED_STYLE : DISARMED_STYLE,
    props.className
  )

  useWindowListener('click', () => armed && setArmed(false))

  return (
    <button type="button" onClick={handleClick} className={className}>
      <Icon name={DELETE_ICON} />
      <div
        className={cx(
          WRAPPER_STYLE,
          armed ? WRAPPER_ARMED_STYLE : WRAPPER_DISARMED_STYLE
        )}
      >
        <span className={COPY_STYLE}>{DELETE_COPY}</span>
      </div>
    </button>
  )

  function handleClick(event: React.MouseEvent): void {
    stopPropagation(event)

    if (armed) {
      setArmed(false)
      props.onClick()
    } else {
      setArmed(true)
    }
  }
}
