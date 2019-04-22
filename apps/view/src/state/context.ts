import React, {useContext} from 'react'

import {Store, State, Dispatch} from './types'

export const INITIAL_STATE: State = {
  appPreferences: {},
  board: null,
  savedBoards: [],
  mode: null,
  loading: false,
  updating: false,
  downloading: false,
  layerVisibility: {},
  error: null,
}

export const StoreContext = React.createContext<Store>({
  getState: () => INITIAL_STATE,
  dispatch: a => a,
})

export const useAppState = (): State & {dispatch: Dispatch} => {
  const {getState, dispatch} = useContext(StoreContext)
  return {...getState(), dispatch}
}
