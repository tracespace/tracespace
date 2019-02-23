import React, {useEffect, useRef} from 'react'

import {ErrorObject} from '../types'
import {useAppState, dismissError} from '../state'
import {Slide} from '../ui'
import Toast from './Toast'

export default function ErrorToast(): JSX.Element {
  const {error, dispatch} = useAppState()
  const prevErrorRef = useRef<ErrorObject | null>(null)

  useEffect(() => {
    prevErrorRef.current = error
  })

  const prevErrorMessage = prevErrorRef.current
    ? prevErrorRef.current.message
    : null

  return (
    <Slide in={!!error} from="top">
      <Toast dismiss={() => dispatch(dismissError())}>
        {error ? error.message : prevErrorMessage}
      </Toast>
    </Slide>
  )
}
