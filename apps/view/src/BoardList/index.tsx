import React, {useState, useEffect} from 'react'

import {useAppState, getBoard} from '../state'
import {usePrevious} from '../hooks'
import {Fade, Slide} from '../ui'
import ShowButton from './ShowButton'
import SavedBoardList from './SavedBoardList'

export default function BoardList(): JSX.Element {
  const {mode, loading, board, savedBoards, dispatch} = useAppState()
  const [show, setShow] = useState(mode === null)
  const [selected, setSelected] = useState(board ? board.id : null)
  const prevLoading = usePrevious(loading)

  useEffect(() => {
    if (prevLoading && !loading && board) {
      setShow(false)
      setSelected(board.id)
    }
  }, [prevLoading, loading, board])

  const haveBoards = savedBoards.length > 0
  const showList = haveBoards && show

  return (
    <>
      <Fade in={haveBoards}>
        <ShowButton show={showList} toggle={() => setShow(!show)} />
      </Fade>
      <Slide in={showList} from="right">
        <SavedBoardList
          selectedId={selected}
          boards={savedBoards}
          onItemClick={(id: string) => {
            dispatch(getBoard(id))
            setSelected(id)
          }}
        />
      </Slide>
    </>
  )
}
