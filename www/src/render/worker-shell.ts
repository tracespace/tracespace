import {call} from './worker'
import type {WorkerAction} from './actions'

export interface MessageId {
  id: string
}

async function handleMessage(
  event: MessageEvent<WorkerAction & MessageId>
): Promise<void> {
  const {id, ...request} = event.data
  const response = await call(request)

  self.postMessage({id, ...response})
}

self.addEventListener('message', handleMessage)
