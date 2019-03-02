import React from 'react'
import cx from 'classnames'

import {Fade} from '../ui'
import {LayerRender} from '../types'
import VisibilityButton from './VisibilityButton'

type Props = LayerRender & {showFilenames: boolean}

const TYPE_UNKNOWN = 'unknown'

const STYLE = 'flex items-center h2 mb2 pl3 br3 overflow-hidden bg-white shadow'
const TYPE_STYLE = 'f6 lh-title mv0 w-auto mr-auto'
const TYPE_STYLE_EXPANDED = 'flex-none'
const FILENAME_STYLE = 'f6 lh-title w-60 mv0 ph2 code truncate'
const VIS_BUTTON_STYLE = 'dib br0 f5 flex-none'

export default function FileItem(props: Props): JSX.Element {
  const {id, side, type, converter, filename, color, showFilenames} = props

  return (
    <li className={STYLE}>
      <p className={cx(TYPE_STYLE, {[TYPE_STYLE_EXPANDED]: showFilenames})}>
        {type || TYPE_UNKNOWN}
      </p>

      <Fade in={showFilenames}>
        <p className={FILENAME_STYLE}>{filename}</p>
      </Fade>

      <VisibilityButton
        {...{id, side, type, converter, color}}
        className={VIS_BUTTON_STYLE}
      />
    </li>
  )
}
