import React from 'react'

import {Button, Icon} from '../ui'

type Props = {
  showFilenames: boolean
  toggle: () => void
}

const STYLE = 'absolute left-1 bottom-2 flex items-center f5'
const LABEL_STYLE = 'dib lh-title mv0 ml2 mr3'

export default function ShowFilenamesButton(props: Props): JSX.Element {
  const {showFilenames, toggle} = props

  return (
    <Button className={STYLE} onClick={toggle}>
      <Icon name={showFilenames ? 'chevron-left' : 'chevron-right'} />
      <p className={LABEL_STYLE}>
        {`${showFilenames ? 'Hide' : 'Show'} filenames`}
      </p>
    </Button>
  )
}
