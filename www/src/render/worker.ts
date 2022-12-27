import {read, plot, renderFragments} from '@tracespace/core'
import type {RenderFragmentsResult} from '@tracespace/core'

import type {WorkerAction} from './actions'

export type WorkerResponse = RenderFragmentsResult

export async function call(action: WorkerAction): Promise<WorkerResponse> {
  const readResult = await read(action.files)
  const plotResult = plot(readResult)
  const renderResult = renderFragments(plotResult)

  return renderResult
}
