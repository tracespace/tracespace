import React from 'react'

import {useAppState} from '../state'
import {PageTitle, Slide} from '../ui'
import {FileEvent} from '../types'
import AppSettings from '../AppSettings'
import BoardSettings from '../BoardSettings'
import FileControls from './FileControls'

import Footer from './Footer'

type Props = {
  handleFiles: (event: FileEvent) => void
  handleUrl: (url: string) => void
}

const STYLE = 'flex items-start justify-between relative w-100 h3'
const TITLE_STYLE = 'w-third flex-none'
const BUTTON_WRAPPER_STYLE = 'flex-none flex items-start justify-end w-third'
const BUTTON_STYLE = 'ml1 pa1 f3'

export default function Nav(props: Props): JSX.Element {
  const {board, loading, updating} = useAppState()
  const {handleFiles, handleUrl} = props
  const show = !loading && board !== null

  return (
    <nav className={STYLE}>
      <PageTitle subtitle="view" className={TITLE_STYLE} />
      {board && (
        <Slide in={show} from="top">
          <BoardSettings board={board} updating={updating} />
        </Slide>
      )}
      <div className={BUTTON_WRAPPER_STYLE}>
        <FileControls
          buttonClassName={BUTTON_STYLE}
          handleFiles={handleFiles}
          handleUrl={handleUrl}
        />
        <AppSettings buttonClassName={BUTTON_STYLE} />
      </div>
      <Footer />
    </nav>
  )
}
