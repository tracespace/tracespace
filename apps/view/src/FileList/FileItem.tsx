import React from 'react'
import cx from 'classnames'

import {Fade} from '../ui'
import {LayerRender} from '../types'
import VisibilityButton from './VisibilityButton'

type Props = LayerRender & {showFilenames: boolean}

const UNKNOWN = 'unknown'

export default function FileItem(props: Props): JSX.Element {
  const {id, side, type, converter, filename, color, showFilenames} = props

  return (
    <li className="flex items-center h2 mb2 pl3 br3 overflow-hidden bg-white shadow">
      <p
        className={cx('f6 lh-title mv0 w-auto mr-auto', {
          'flex-none': showFilenames,
        })}
      >
        {type || UNKNOWN}
      </p>

      <Fade in={showFilenames}>
        <p className="f6 lh-title w-60 mv0 ph2 code truncate">{filename}</p>
      </Fade>

      <VisibilityButton
        {...{id, side, type, converter, color}}
        className="dib br0 f5 flex-none"
      />
    </li>
  )
}
