import React from 'react'
import cx from 'classnames'

import {BoardSummary} from '../types'
import {LazyThumbnail} from '../ui'

export type BoardItemProps = BoardSummary & {
  onClick: (id: string) => void
  selected: boolean
}

// TODO(mc, 2018-12-26): dedupe this logic
const DEFAULT_COLOR = 'rgba(00, 66, 00, 0.75)'

export default function BoardItem(props: BoardItemProps): JSX.Element {
  const {id, name, selected, options, thumbnail} = props
  const color = options.color.sm || DEFAULT_COLOR
  const handleClick = (): unknown => !selected && props.onClick(id)

  return (
    <li
      className={cx('dib w-50 pl3 pb3 fr', {pointer: !selected})}
      onClick={handleClick}
    >
      <div className={cx('relative overflow-hidden w-100 h4 br3 shadow')}>
        <div className="w-100 h-100 bg-white">
          <p
            className={cx('f6 lh-title mv0 mh4 pt2 tc truncate', {
              b: selected,
            })}
          >
            {name}
          </p>
          <LazyThumbnail
            url={thumbnail}
            spinnerColor={color}
            className="absolute top-2 bottom-1 left-1 right-1"
          />
        </div>
      </div>
    </li>
  )
}
