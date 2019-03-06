import React from 'react'

import {Button, Icon} from '../ui'

type Props = {
  show: boolean
  toggle: () => void
}

export default function ShowButton(props: Props): JSX.Element {
  const {show, toggle} = props

  return (
    <Button
      className="absolute top-5 right-1 flex items-center f5"
      onClick={toggle}
    >
      <p className="dib lh-title mv0 ml3 mr2">
        {`${show ? 'Hide' : 'Show'} saved boards`}
      </p>
      <Icon name={show ? 'chevron-right' : 'chevron-left'} />
    </Button>
  )
}
