import React from 'react'

import {useStore} from './store'
import {StateContext} from './context'
import {Middleware} from './types'

export type StateProviderProps = {
  middleware: Array<Middleware>
  children: React.ReactNode
}

export default function StateProvider(props: StateProviderProps): JSX.Element {
  const {getState, dispatch} = useStore(props.middleware)

  return (
    <StateContext.Provider value={{...getState(), dispatch}}>
      {props.children}
    </StateContext.Provider>
  )
}
