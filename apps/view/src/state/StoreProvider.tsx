import React, {useState, useRef, useEffect} from 'react'

import reducer from './reducer'
import createMiddleware from './middleware'
import {INITIAL_STATE, StoreContext} from './context'
import {State, Dispatch, Action} from './types'

export type StoreProps = {
  children: React.ReactNode
}

export default function StoreProvider(props: StoreProps): JSX.Element {
  const [state, setState] = useState(INITIAL_STATE)
  const stateRef = useRef<State>(state)
  const dispatchRef = useRef<Dispatch>(a => a)
  const store = {
    getState: (): State => stateRef.current,
    dispatch: (action: Action) => dispatchRef.current(action),
  }

  useEffect((): void => {
    dispatchRef.current = createMiddleware().reduceRight<Dispatch>(
      (next, handler) => handler(store)(next),
      function baseDispatch(action) {
        stateRef.current = reducer(stateRef.current, action)
        setState(stateRef.current)
        return action
      }
    )
  }, [])

  return (
    <StoreContext.Provider value={store}>
      {props.children}
    </StoreContext.Provider>
  )
}
