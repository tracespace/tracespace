import React, {useState} from 'react'

import {useAppState} from '../state'
import {Fade, Slide} from '../ui'
import SideList from './SideList'
import ShowFilenamesButton from './ShowFilenamesButton'

export default function FileList(): JSX.Element {
  const {loading, board} = useAppState()
  const [showFilenames, setShowFilenames] = useState(false)

  const layers = board ? board.layers : []
  const show = !loading && board !== null

  return (
    <>
      <Slide in={show} from="left">
        <SideList layers={layers} showFilenames={showFilenames} />
      </Slide>
      <Fade in={show}>
        <ShowFilenamesButton
          showFilenames={showFilenames}
          toggle={() => setShowFilenames(!showFilenames)}
        />
      </Fade>
    </>
  )
}
