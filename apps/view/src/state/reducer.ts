import * as actionTypes from './actions'
import {INITIAL_STATE} from './context'
import {Action, State} from './types'

export default function reducer(state: State, action: Action): State {
  switch (action.type) {
    case actionTypes.APP_PREFERENCES: {
      return {...state, appPreferences: action.payload}
    }

    case actionTypes.CREATE_BOARD:
    case actionTypes.CREATE_BOARD_FROM_URL: {
      return {...state, loading: true}
    }

    case actionTypes.GET_BOARD:
    case actionTypes.DELETE_BOARD:
    case actionTypes.DELETE_ALL_BOARDS: {
      return {...state, loading: true}
    }

    case actionTypes.UPDATE_BOARD: {
      const {id, update} = action.payload
      if (!state.board || state.board.id !== id) return state

      return {
        ...state,
        updating: true,
        board: {
          ...state.board,
          name: update.name || state.board.name,
        },
      }
    }

    case actionTypes.GET_BOARD_PACKAGE: {
      return {...state, downloading: true}
    }

    case actionTypes.SET_MODE: {
      return {...state, mode: action.payload}
    }

    case actionTypes.TOGGLE_VISIBILITY: {
      const {id, solo} = action.payload
      const {board} = state
      let layerVisibility = {
        ...state.layerVisibility,
        [id]: solo || !state.layerVisibility[id],
      }

      if (solo) {
        const layers = board ? board.layers : []
        const otherIds = layers.map(ly => ly.id).filter(lyId => lyId !== id)
        const nextVisibilty = otherIds.every(lyId => !layerVisibility[lyId])

        layerVisibility = otherIds.reduce(
          (result, id) => ({...result, [id]: nextVisibilty}),
          layerVisibility
        )
      }

      return {...state, layerVisibility}
    }

    case actionTypes.WORKER_INITIALIZED: {
      return {...state, savedBoards: action.payload}
    }

    case actionTypes.BOARD_RENDERED: {
      const {mode, layerVisibility: prevLayerVisibility} = state
      const board = action.payload
      const layerVisibility = board.layers.reduce((result, ly) => {
        const prevVisibility = prevLayerVisibility[ly.id]
        return {
          ...result,
          [ly.id]: prevVisibility != null ? prevVisibility : true,
        }
      }, {})

      return {
        ...state,
        board,
        layerVisibility,
        mode: mode || 'top',
        loading: false,
        updating: false,
      }
    }

    case actionTypes.BOARD_UPDATED: {
      const updatedBoard = action.payload
      const savedBoards = state.savedBoards.map(b =>
        b.id === updatedBoard.id ? updatedBoard : b
      )

      if (savedBoards.indexOf(updatedBoard) < 0) savedBoards.push(updatedBoard)

      return {...state, savedBoards}
    }

    case actionTypes.BOARD_DELETED: {
      const id = action.payload
      const savedBoards = state.savedBoards.filter(b => b.id !== id)
      let {board, mode} = state

      if (board && board.id === id) {
        board = null
        mode = null
      }

      return {...state, mode, board, savedBoards, loading: false}
    }

    case actionTypes.BOARD_PACKAGED: {
      return {...state, downloading: false}
    }

    case actionTypes.ALL_BOARDS_DELETED: {
      return INITIAL_STATE
    }

    case actionTypes.DISMISS_ERROR: {
      return {...state, error: null}
    }

    case actionTypes.WORKER_ERRORED: {
      const nextState = {...state, error: action.payload.error}

      switch (action.payload.request.type) {
        case actionTypes.CREATE_BOARD:
        case actionTypes.CREATE_BOARD_FROM_URL:
        case actionTypes.DELETE_BOARD:
        case actionTypes.DELETE_ALL_BOARDS:
          return {...nextState, loading: false}

        case actionTypes.UPDATE_BOARD:
          return {...nextState, updating: false}

        case actionTypes.GET_BOARD_PACKAGE:
          return {...nextState, downloading: false}
      }

      return nextState
    }
  }

  return state
}
