import React from 'react'

import {stopPropagation} from '../events'
import {BoardSummary} from '../types'
import BoardItem from './BoardItem'

const STYLE = 'absolute right-0 top-7 bottom-5 w-third overflow-hidden'
const WRAPPER_STYLE = 'w-100 mxh-100 ph3 overflow-y-auto scrollbar-white'
const LIST_STYLE = 'list mt1 mb0 pl0 near-black'

type Props = {
  selectedId: string | null
  boards: Array<BoardSummary>
  onItemClick: (id: string) => void
}

export default function SavedBoardList(props: Props): JSX.Element {
  const {selectedId, boards, onItemClick} = props

  return (
    <div className={STYLE}>
      <div onWheel={stopPropagation} className={WRAPPER_STYLE}>
        <ul className={LIST_STYLE}>
          {boards.map(b => (
            <BoardItem
              {...b}
              key={b.id}
              selected={b.id === selectedId}
              onClick={onItemClick}
            />
          ))}
        </ul>
      </div>
    </div>
  )
}
