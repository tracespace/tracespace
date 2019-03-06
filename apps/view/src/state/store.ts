// application store and side-effects
import {useReducer, useCallback, useRef, useEffect} from 'react'
import {saveAs} from 'file-saver'

import log from '../logger'
import RenderWorker, {WorkerMessageEvent} from '../RenderWorker'
import * as actions from './actions'
import {INITIAL_STATE} from './context'
import reducer from './reducer'
import {ContextProps, Action} from './types'

export function useStore(): ContextProps {
  const [state, _dispatch] = useReducer(reducer, INITIAL_STATE)
  const worker = useRef<RenderWorker | null>(null)

  // dispatch with side-effects
  const dispatch = useCallback(
    (action: Action) => {
      log.debug('dispatch', action)
      _dispatch(action)

      switch (action.type) {
        case actions.CREATE_BOARD:
        case actions.CREATE_BOARD_FROM_URL:
        case actions.GET_BOARD:
        case actions.GET_BOARD_PACKAGE:
        case actions.UPDATE_BOARD:
        case actions.DELETE_BOARD:
        case actions.DELETE_ALL_BOARDS: {
          log.debug('sending action to RenderWorker', action.type)
          worker.current && worker.current.postMessage(action)
          break
        }

        case actions.WORKER_INITIALIZED: {
          const query = new URLSearchParams(window.location.search.slice(1))
          const url = query.get('boardUrl')

          if (url) dispatch(actions.createBoardFromUrl(url))
          break
        }

        case actions.BOARD_PACKAGED: {
          saveAs(action.payload.file, `${action.payload.name}.zip`)
          break
        }
      }
    },
    [log]
  )

  useEffect(() => {
    worker.current = new RenderWorker()
    worker.current.onmessage = (event: WorkerMessageEvent) => {
      log.debug('action recieved from RenderWorker', event.data.type)
      dispatch(event.data)
    }

    return () => {
      worker.current && worker.current.terminate()
    }
  }, [])

  return {...state, dispatch}
}
