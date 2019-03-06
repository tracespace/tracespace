import React, {useState, useRef, useEffect} from 'react'

import {stopPropagation} from '../events'
import {BoardRender} from '../types'
import {Button, Icon, Fade} from '../ui'
import {BoardName} from './name'
import ModeSelect from './ModeSelect'
import SettingsForm from './SettingsForm'

export type BoardSettingsProps = {
  board: BoardRender
  updating: boolean
}

const OPEN_BUTTON_TOOLTIP = 'Board settings'

const STYLE = 'dib ph3 tc v-top w-third'
const NAME_STYLE = 'flex items-center justify-center'
const OPEN_BUTTON_STYLE = 'nr4'
const MODAL_STYLE = 'fixed top-1 left-0 right-0 bottom-1 z-1 nt2'
const MODAL_CONTENTS_STYLE =
  'relative w-50 mxh-100 center pt2 ph4 br3 near-black bg-white shadow overflow-y-auto scrollbar-near-black'

const FORM_STYLE = 'dib w-100'

export default function BoardSettings(props: BoardSettingsProps): JSX.Element {
  const [open, setOpen] = useState(false)
  const modalContentsRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const $modalContents = modalContentsRef.current

    if ($modalContents) {
      const {width} = $modalContents.getBoundingClientRect()
      const clientWidth = $modalContents.clientWidth
      const shift = (width - clientWidth) / 2

      // shift modal contents by scrollbar width if present
      $modalContents.style.transform = `translateX(${shift}px)`
    }
  })

  const {board, updating} = props
  const toggleOpen = (): void => setOpen(!open)

  return (
    <div className={STYLE}>
      <div className={NAME_STYLE}>
        <BoardName>{board.name}</BoardName>
        <Button
          onClick={toggleOpen}
          disabled={updating}
          className={OPEN_BUTTON_STYLE}
          title={OPEN_BUTTON_TOOLTIP}
        >
          <Icon
            name={updating ? 'spinner' : 'cog'}
            faProps={{pulse: updating}}
          />
        </Button>
      </div>
      <ModeSelect />
      <Fade in={open}>
        <div className={MODAL_STYLE} onWheel={stopPropagation}>
          <div className={MODAL_CONTENTS_STYLE} ref={modalContentsRef}>
            <SettingsForm
              className={FORM_STYLE}
              board={board}
              close={toggleOpen}
            />
          </div>
        </div>
      </Fade>
    </div>
  )
}
