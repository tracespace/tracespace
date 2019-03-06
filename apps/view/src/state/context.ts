import React, {useContext} from 'react'

import {State, ContextProps} from './types'

export const INITIAL_STATE: State = {
  board: null,
  savedBoards: [],
  mode: null,
  loading: false,
  updating: false,
  downloading: false,
  layerVisibility: {},
  error: null,
}

export const StateContext = React.createContext<ContextProps>({
  ...INITIAL_STATE,
  dispatch: () => {},
})

export const useAppState = (): ContextProps => useContext(StateContext)
