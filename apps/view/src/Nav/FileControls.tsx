import React, {useState} from 'react'

import {useAppState, getBoardPackage} from '../state'
import {Button, Icon} from '../ui'
import {FileEvent} from '../types'
import OpenFileDrawer from './OpenFileDrawer'

const DOWNLOAD_TOOLTIP = 'Download SVG renders'
const UPLOAD_TOOLTIP = 'Upload Gerber/drill files'

export type FileControlsProps = {
  buttonClassName: string
  handleFiles: (event: FileEvent) => void
  handleUrl: (url: string) => void
}

export default function FileControls(props: FileControlsProps): JSX.Element {
  const {board, loading, downloading, dispatch} = useAppState()
  const [open, setOpen] = useState(false)
  const {buttonClassName} = props

  const toggleUploadOpen = (): void => setOpen(!open)

  const handleFiles = (event: FileEvent): void => {
    setOpen(false)
    props.handleFiles(event)
  }

  const handleUrl = (url: string): void => {
    setOpen(false)
    props.handleUrl(url)
  }

  const downloadBoard = (): void => {
    if (board) {
      dispatch(getBoardPackage(board.id))
    }
  }

  return (
    <>
      <Button
        className={buttonClassName}
        onClick={toggleUploadOpen}
        disabled={loading}
        title={UPLOAD_TOOLTIP}
      >
        <Icon name="plus" />
      </Button>
      <Button
        className={buttonClassName}
        onClick={downloadBoard}
        disabled={!board || downloading}
        title={DOWNLOAD_TOOLTIP}
      >
        <Icon
          name={downloading ? 'spinner' : 'file-download'}
          faProps={{pulse: downloading}}
        />
      </Button>
      <OpenFileDrawer
        open={open}
        handleFiles={handleFiles}
        handleUrl={handleUrl}
        close={toggleUploadOpen}
      />
    </>
  )
}
