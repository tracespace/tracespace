import WorkerShell from './worker-shell?worker'

import type {WorkerAction} from './actions'
import type {WorkerResponse} from './worker'
import type {MessageId} from './worker-shell'

export interface WorkerWrapper {
  call(request: WorkerAction): Promise<WorkerResponse>
}

let worker: Worker

export async function callWorker(
  request: WorkerAction
): Promise<WorkerResponse> {
  return new Promise((resolve, reject) => {
    const id = Math.floor(Math.random() * Number.MAX_SAFE_INTEGER).toString(16)

    worker = worker ?? new WorkerShell()
    worker.addEventListener('message', handleMessage)
    worker.addEventListener('error', handleError)
    worker.postMessage({id, ...request})

    function handleMessage(
      event: MessageEvent<WorkerResponse & MessageId>
    ): void {
      const {id: responseId, ...response} = event.data

      if (responseId === id) {
        removeListeners()
        resolve(response)
      }
    }

    function handleError(event: Event): void {
      removeListeners()
      console.error('Render worker encountered an error', event)
      reject(new Error('Render worker encountered an error'))
    }

    function removeListeners() {
      worker.removeEventListener('message', handleMessage)
      worker.removeEventListener('error', handleError)
    }
  })
}
