import React from 'react'

import pkg from '../../package.json'
import {useAppState, deleteAllBoards} from '../state'
import {DeleteButton, Drawer, Label} from '../ui'

const TITLE = 'app settings'
const FOOTER = `tracespace v${pkg.version}`

const DELETE_SAVED_COPY = 'delete all saved boards'

const DELETE_COPY_STYLE = 'mr-auto'
const DELETE_BUTTON_STYLE = 'nr2'
const FOOTER_STYLE = 'mt3 mb1 f7 lh-copy'

type Props = {
  open: boolean
  close: () => void
}

export default function SettingsDrawer(props: Props): JSX.Element {
  const {dispatch} = useAppState()
  const {open, close} = props

  const handleDeleteAllClick = (): void => {
    dispatch(deleteAllBoards())
    close()
  }

  return (
    <Drawer title={TITLE} open={open} close={close}>
      <Label>
        <span className={DELETE_COPY_STYLE}>{DELETE_SAVED_COPY}</span>
        <DeleteButton
          className={DELETE_BUTTON_STYLE}
          onClick={handleDeleteAllClick}
        />
      </Label>
      <footer className={FOOTER_STYLE}>{FOOTER}</footer>
    </Drawer>
  )
}
