import React from 'react'

import {useAppState, dismissError} from '../state'
import {usePrevious} from '../hooks'
import {Slide} from '../ui'
import Toast from './Toast'

export default function ErrorToast(): JSX.Element {
  const {error, dispatch} = useAppState()
  const prevError = usePrevious(error)
  const prevErrorMessage = prevError ? prevError.message : null

  return (
    <Slide in={!!error} from="top">
      <Toast dismiss={() => dispatch(dismissError())}>
        {error ? error.message : prevErrorMessage}
      </Toast>
    </Slide>
  )
}
