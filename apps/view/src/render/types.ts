import {Action} from '../state'

export type WorkerMessageEvent = {data: Action}

export type RenderWorkerContext = {
  onmessage: (event: WorkerMessageEvent) => void
  postMessage(message: Action): void
}
