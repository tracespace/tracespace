import {
  AppPreferences,
  BoardRender,
  BoardSummary,
  BoardUpdate,
  LayerVisibilityMap,
  Mode,
  ErrorObject,
} from '../types'

export type State = {
  appPreferences: AppPreferences
  board: BoardRender | null
  savedBoards: Array<BoardSummary>
  mode: Mode
  loading: boolean
  updating: boolean
  downloading: boolean
  layerVisibility: LayerVisibilityMap
  error: null | ErrorObject
}

export type Reducer = (state: State, action: Action) => State

export type Dispatch = (action: Action) => Action

export type Store = {getState: () => State; dispatch: Dispatch}

export type Middleware = (store: Store) => (next: Dispatch) => Dispatch

export type Action =
  | {type: 'FETCH_APP_PREFERENCES'}
  | {type: 'UPDATE_APP_PREFERENCES'; payload: AppPreferences}
  | {type: 'APP_PREFERENCES'; payload: AppPreferences}
  | {
      type: 'CREATE_BOARD'
      payload: Array<File>
      metadata: {dragAndDrop: boolean}
    }
  | {type: 'CREATE_BOARD_FROM_URL'; payload: string}
  | {type: 'GET_BOARD'; payload: string}
  | {type: 'UPDATE_BOARD'; payload: {id: string; update: BoardUpdate}}
  | {type: 'DELETE_BOARD'; payload: string}
  | {type: 'DELETE_ALL_BOARDS'}
  | {type: 'GET_BOARD_PACKAGE'; payload: string}
  | {type: 'SET_MODE'; payload: Mode}
  | {type: 'TOGGLE_VISIBILITY'; payload: {id: string; solo: boolean}}
  | {type: 'BOARD_RENDERED'; payload: BoardRender; metadata: {time: number}}
  | {type: 'BOARD_UPDATED'; payload: BoardSummary}
  | {type: 'BOARD_DELETED'; payload: string}
  | {type: 'BOARD_PACKAGED'; payload: {id: string; name: string; file: Blob}}
  | {type: 'ALL_BOARDS_DELETED'}
  | {type: 'WORKER_INITIALIZED'; payload: Array<BoardSummary>}
  | {type: 'WORKER_ERRORED'; payload: {request: Action; error: ErrorObject}}
  | {type: 'DISMISS_ERROR'}
