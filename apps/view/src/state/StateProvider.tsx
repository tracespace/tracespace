import React from 'react'

import {useStore} from './store'
import {StateContext} from './context'

export type StateProviderProps = {children: React.ReactNode}

export default function StateProvider(props: StateProviderProps): JSX.Element {
  const contextValue = useStore()

  return (
    <StateContext.Provider value={contextValue}>
      {props.children}
    </StateContext.Provider>
  )
}
