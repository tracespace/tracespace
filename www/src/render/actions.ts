export const INITIAL_RENDER = 'initialRender'

export interface InitialRenderAction {
  type: typeof INITIAL_RENDER
  files: File[]
}

export type WorkerAction = InitialRenderAction
