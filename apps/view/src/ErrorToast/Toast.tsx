import React from 'react'

import {useTimeout} from '../hooks'
import {Button, Icon} from '../ui'

const STYLE = 'dib center fixed top-1 left-0 right-0 tc'
const WRAPPER_STYLE =
  'inline-flex items-center justify-center pl3 pv1 pr1 br2 bg-red white shadow'
const MESSAGE_STYLE = 'mv0 mr2'

const DISMISS_TIMEOUT = 4000

export type ToastProps = {
  dismiss: () => unknown
  children: React.ReactNode
}

export default function Toast(props: ToastProps): JSX.Element {
  const {dismiss, children} = props

  useTimeout(dismiss, DISMISS_TIMEOUT)

  return (
    <div className={STYLE}>
      <div className={WRAPPER_STYLE}>
        <p className={MESSAGE_STYLE}>
          {'Error: '}
          {children}
        </p>
        <Button onClick={dismiss}>
          <Icon name="times" />
        </Button>
      </div>
    </div>
  )
}
