import {saveAs} from 'file-saver'
import * as State from '../state'
import log from '../logger'
import RenderWorker from './worker'
import {WorkerMessageEvent} from './types'

export function createRenderMiddleware(): State.Middleware {
  const worker = new RenderWorker()

  return store => {
    const {dispatch} = store

    worker.onmessage = function handleWorkerMessage(event: WorkerMessageEvent) {
      log.debug('action received from RenderWorker', event.data.type)
      dispatch(event.data)
    }

    return next => action => {
      switch (action.type) {
        case State.CREATE_BOARD:
        case State.CREATE_BOARD_FROM_URL:
        case State.GET_BOARD:
        case State.GET_BOARD_PACKAGE:
        case State.UPDATE_BOARD:
        case State.DELETE_BOARD:
        case State.DELETE_ALL_BOARDS: {
          log.debug('sending action to RenderWorker', action.type)
          worker.postMessage(action)
          break
        }

        case State.WORKER_INITIALIZED: {
          const query = new URLSearchParams(window.location.search.slice(1))
          const url = query.get('boardUrl')

          if (url) dispatch(State.createBoardFromUrl(url))
          break
        }

        case State.BOARD_PACKAGED: {
          saveAs(action.payload.file, `${action.payload.name}.zip`)
          break
        }
      }

      return next(action)
    }
  }
}
