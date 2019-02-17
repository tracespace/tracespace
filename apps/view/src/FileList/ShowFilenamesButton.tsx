import React from 'react'

import {Button, Icon} from '../ui'

type Props = {
  showFilenames: boolean
  toggle: () => void
}

export default function ShowFilenamesButton(props: Props): JSX.Element {
  const {showFilenames, toggle} = props

  return (
    <Button
      className="absolute left-1 bottom-2 flex items-center f5"
      onClick={toggle}
    >
      <Icon name={showFilenames ? 'chevron-left' : 'chevron-right'} />
      <p className="dib lh-title mv0 ml2 mr3">
        {`${showFilenames ? 'Hide' : 'Show'} filenames`}
      </p>
    </Button>
  )
}
