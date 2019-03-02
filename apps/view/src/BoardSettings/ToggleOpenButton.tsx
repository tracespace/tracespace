import React from 'react'
import cx from 'classnames'

import {Button, Icon, ButtonProps} from '../ui'

type Props = {
  open: boolean
  onClick: ButtonProps['onClick']
}

const SETTINGS_TOOLTIP = 'Board settings'

const STYLE = 'dib ml2 v-mid'
const OPEN_STYLE = 'absolute top-0 right-0'
const CLOSED_STYLE = 'nr4'

export default function ToggleOpenButton(props: Props): JSX.Element {
  const {open, onClick} = props
  const iconName = open ? 'times' : 'cog'

  return (
    <Button
      onClick={onClick}
      className={cx(STYLE, open ? OPEN_STYLE : CLOSED_STYLE)}
      title={SETTINGS_TOOLTIP}
    >
      <Icon name={iconName} />
    </Button>
  )
}
