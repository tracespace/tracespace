import React from 'react'
import cx from 'classnames'

import {Button, Icon, ButtonProps} from '../ui'

type Props = {
  open: boolean
  onClick: ButtonProps['onClick']
}

const SETTINGS_TOOLTIP = 'Board settings'

export default function ToggleOpenButton(props: Props): JSX.Element {
  const {open, onClick} = props
  const iconName = open ? 'times' : 'cog'

  return (
    <Button
      onClick={onClick}
      className={cx('dib ml2 v-mid', open ? 'absolute top-0 right-0' : 'nr4')}
      title={SETTINGS_TOOLTIP}
    >
      <Icon name={iconName} />
    </Button>
  )
}
