// application store and side-effects
import {useState, useRef, useEffect} from 'react'

import {INITIAL_STATE} from './context'
import reducer from './reducer'
import {Store, State, Action, Dispatch, Middleware} from './types'

export function useStore(middleware: Array<Middleware>): Store {
  // useState is used to trigger re-renders, but actual state is in mutable ref
  const [_state, setState] = useState(INITIAL_STATE)

  // state and dispatch are mutable refs so state changes are synchronous
  // and getState always returns the state at that exact moment
  const state = useRef<State>(_state)
  const dispatch = useRef<Dispatch>(
    (action: Action): void => {
      state.current = reducer(state.current, action)
      setState(state.current)
    }
  )

  const store = {
    getState: () => state.current,
    dispatch: (action: Action) => dispatch.current(action),
  }

  useEffect(() => {
    for (let i = middleware.length - 1; i >= 0; i--) {
      dispatch.current = middleware[i](store)(dispatch.current)
    }
  }, [middleware])

  return store
}
