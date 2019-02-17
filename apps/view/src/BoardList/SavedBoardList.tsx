import React from 'react'

import {stopPropagation} from '../events'
import {BoardSummary} from '../types'
import BoardItem from './BoardItem'

type Props = {
  selectedId: string | null
  boards: Array<BoardSummary>
  onItemClick: (id: string) => void
}

export default function SideList(props: Props): JSX.Element {
  const {selectedId, boards, onItemClick} = props

  return (
    <div className="absolute right-0 top-7 bottom-5 w-third overflow-y-hidden">
      <div
        onWheel={stopPropagation}
        className="w-100 mxh-100 ph3 overflow-y-auto"
      >
        <ul className="list mxh-100 mt1 mb0 pl0 overflow-y-auto near-black">
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
