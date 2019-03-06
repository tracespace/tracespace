import {Action} from '../state'

export type WorkerMessageEvent = {data: Action}

export class RenderWorker extends Worker {
  constructor()
  onmessage: (event: WorkerMessageEvent) => void
  postMessage(message: Action): void
}

export type RenderWorkerContext = {
  onmessage: (event: WorkerMessageEvent) => void
  postMessage(message: Action): void
}
