import {
  BoardRender,
  Board,
  BoardSummary,
  BoardUpdate,
  LayerVisibilityMap,
  Mode,
  ErrorObject,
} from '../types'

export type State = {
  board: BoardRender | null
  savedBoards: Array<BoardSummary>
  mode: Mode
  loading: boolean
  updating: boolean
  downloading: boolean
  layerVisibility: LayerVisibilityMap
  error: null | ErrorObject
}

export type Dispatch = (action: Action) => void

export type EffectsHandler = (action: Action) => void

export type ContextProps = State & {dispatch: Dispatch}

export type Action =
  | {type: 'CREATE_BOARD'; payload: Array<File>}
  | {type: 'CREATE_BOARD_FROM_URL'; payload: string}
  | {type: 'GET_BOARD'; payload: string}
  | {type: 'UPDATE_BOARD'; payload: {id: string; update: BoardUpdate}}
  | {type: 'DELETE_BOARD'; payload: string}
  | {type: 'DELETE_ALL_BOARDS'}
  | {type: 'GET_BOARD_PACKAGE'; payload: string}
  | {type: 'SET_MODE'; payload: Mode}
  | {type: 'TOGGLE_VISIBILITY'; payload: {id: string; solo: boolean}}
  | {type: 'BOARD_RENDERED'; payload: BoardRender}
  | {type: 'BOARD_UPDATED'; payload: Board}
  | {type: 'BOARD_DELETED'; payload: string}
  | {type: 'BOARD_PACKAGED'; payload: {name: string; file: Blob}}
  | {type: 'ALL_BOARDS_DELETED'}
  | {type: 'WORKER_INITIALIZED'; payload: Array<BoardSummary>}
  | {type: 'WORKER_ERRORED'; payload: {request: Action; error: ErrorObject}}
  | {type: 'DISMISS_ERROR'}
