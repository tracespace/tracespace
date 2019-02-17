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

const BUTTON_STYLE = 'ml1 pa1 f3'

export default function Nav(props: Props): JSX.Element {
  const {board, loading, updating} = useAppState()
  const {handleFiles, handleUrl} = props
  const show = !loading && board !== null

  return (
    <nav className="flex items-start justify-between relative w-100 h3">
      <PageTitle subtitle="view" className="w-third flex-none" />
      {board && (
        <Slide in={show} from="top">
          <BoardSettings board={board} updating={updating} />
        </Slide>
      )}
      <div className="flex-none flex items-start justify-end w-third">
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
