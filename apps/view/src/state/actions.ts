import {
  AppPreferences,
  BoardSummary,
  BoardUpdate,
  BoardRender,
  Mode,
} from '../types'

import {Action} from './types'

export const FETCH_APP_PREFERENCES = 'FETCH_APP_PREFERENCES'
export const UPDATE_APP_PREFERENCES = 'UPDATE_APP_PREFERENCES'
export const APP_PREFERENCES = 'APP_PREFERENCES'
export const CREATE_BOARD = 'CREATE_BOARD'
export const CREATE_BOARD_FROM_URL = 'CREATE_BOARD_FROM_URL'
export const GET_BOARD = 'GET_BOARD'
export const GET_BOARD_PACKAGE = 'GET_BOARD_PACKAGE'
export const UPDATE_BOARD = 'UPDATE_BOARD'
export const DELETE_BOARD = 'DELETE_BOARD'
export const DELETE_ALL_BOARDS = 'DELETE_ALL_BOARDS'
export const SET_MODE = 'SET_MODE'
export const TOGGLE_VISIBILITY = 'TOGGLE_VISIBILITY'
export const BOARD_RENDERED = 'BOARD_RENDERED'
export const BOARD_UPDATED = 'BOARD_UPDATED'
export const BOARD_DELETED = 'BOARD_DELETED'
export const BOARD_PACKAGED = 'BOARD_PACKAGED'
export const ALL_BOARDS_DELETED = 'ALL_BOARDS_DELETED'
export const WORKER_INITIALIZED = 'WORKER_INITIALIZED'
export const WORKER_ERRORED = 'WORKER_ERRORED'
export const DISMISS_ERROR = 'DISMISS_ERROR'

export const fetchAppPreferences = (): Action => ({
  type: FETCH_APP_PREFERENCES,
})

export const updateAppPreferences = (prefs: AppPreferences): Action => ({
  type: UPDATE_APP_PREFERENCES,
  payload: prefs,
})

export const appPreferences = (prefs: AppPreferences): Action => ({
  type: APP_PREFERENCES,
  payload: prefs,
})

export const createBoard = (
  files: Array<File>,
  dragAndDrop: boolean = false
): Action => ({
  type: CREATE_BOARD,
  payload: files,
  metadata: {dragAndDrop},
})

export const createBoardFromUrl = (url: string): Action => ({
  type: CREATE_BOARD_FROM_URL,
  payload: url,
})

export const getBoard = (id: string): Action => ({
  type: GET_BOARD,
  payload: id,
})

export const updateBoard = (id: string, update: BoardUpdate): Action => ({
  type: UPDATE_BOARD,
  payload: {id, update},
})

export const deleteBoard = (id: string): Action => ({
  type: DELETE_BOARD,
  payload: id,
})

export const deleteAllBoards = (): Action => ({
  type: DELETE_ALL_BOARDS,
})

export const getBoardPackage = (id: string): Action => ({
  type: GET_BOARD_PACKAGE,
  payload: id,
})

export const setMode = (mode: Mode): Action => ({
  type: SET_MODE,
  payload: mode,
})

export const toggleVisibility = (id: string, solo: boolean): Action => ({
  type: TOGGLE_VISIBILITY,
  payload: {id, solo},
})

export const boardRendered = (render: BoardRender, time: number): Action => ({
  type: BOARD_RENDERED,
  payload: render,
  metadata: {time},
})

export const boardUpdated = (board: BoardSummary): Action => ({
  type: BOARD_UPDATED,
  payload: board,
})

export const boardDeleted = (id: string): Action => ({
  type: BOARD_DELETED,
  payload: id,
})

export const boardPackaged = (
  id: string,
  name: string,
  file: Blob
): Action => ({
  type: BOARD_PACKAGED,
  payload: {id, name, file},
})

export const allBoardsDeleted = (): Action => ({
  type: ALL_BOARDS_DELETED,
})

export const workerInitialized = (boards: Array<BoardSummary>): Action => ({
  type: WORKER_INITIALIZED,
  payload: boards,
})

export const workerErrored = (request: Action, error: Error): Action => ({
  type: WORKER_ERRORED,
  payload: {
    request,
    error: {name: error.name, message: error.message, error: error.toString()},
  },
})

export const dismissError = (): Action => ({
  type: DISMISS_ERROR,
})
