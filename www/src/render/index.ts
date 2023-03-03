import type {RenderFragmentsResult} from '@tracespace/core'

import {INITIAL_RENDER} from './actions'
import {callWorker} from './call-worker'

export async function render(files: File[]): Promise<RenderFragmentsResult> {
  return callWorker({type: INITIAL_RENDER, files})
}
