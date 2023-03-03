import {atom, useAtom} from 'jotai'

import type {RenderFragmentsResult} from '@tracespace/core'

import {render} from '../../render'
import type {PanZoomState} from '../../components/use-pan-zoom'

export const FILES_ADDED = 'filesAdded'

export const LAYER_RENDERED = 'layerRendered'

export interface LayerRender {
  filename: string
  svg?: SvgRender
}

export interface SvgRender {
  svgFragment: string
}

const renderResultAtom = atom<RenderFragmentsResult | undefined>(undefined)
const zoomScaleAtom = atom<number | undefined>(undefined)

const writeZoomScaleAtom = atom<undefined, PanZoomState>(
  undefined,
  (get, set, panZoomState) => {
    set(zoomScaleAtom, panZoomState[0])
  }
)

const writeInitialRenderAtom = atom<undefined, File[]>(
  undefined,
  async (get, set, files) => {
    const renderResult = await render(files)
    set(renderResultAtom, renderResult)
  }
)

export function useAddFiles(): (files: File[]) => void {
  const [, addFiles] = useAtom(writeInitialRenderAtom)
  return addFiles
}

export function useUpdateZoomScale(): (panZoomState: PanZoomState) => void {
  const [, updatePanZoom] = useAtom(writeZoomScaleAtom)
  return updatePanZoom
}

export function useRenderResult(): RenderFragmentsResult | undefined {
  const [renderResult] = useAtom(renderResultAtom)
  return renderResult
}

export function useZoomScale(): number | undefined {
  const [scale] = useAtom(zoomScaleAtom)
  return scale
}
