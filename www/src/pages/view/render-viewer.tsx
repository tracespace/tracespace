import {BASE_IMAGE_PROPS} from '@tracespace/renderer'

import type {RenderFragmentsResult} from '@tracespace/core'

import {usePanZoom} from '../../components/use-pan-zoom'
import {LogSlider} from '../../components/log-slider'
import {useZoomScale, useUpdateZoomScale} from './store'

export interface LayersRenderProps {
  render: RenderFragmentsResult
}

const ZOOM_SCALE_INITIAL = 0.8
const ZOOM_SCALE_LIMIT_FACTOR = 24
const ZOOM_SCALE_MIN = ZOOM_SCALE_INITIAL / ZOOM_SCALE_LIMIT_FACTOR
const ZOOM_SCALE_MAX = ZOOM_SCALE_INITIAL * ZOOM_SCALE_LIMIT_FACTOR

export function RenderViewer(props: LayersRenderProps): JSX.Element {
  const {
    layers,
    bottomLayers,
    mechanicalLayers,
    outlineRender,
    svgFragmentsById,
  } = props.render
  const {viewBox, svgFragment: outlineSvgFragment} = outlineRender

  const onPanZoomed = useUpdateZoomScale()
  const [renderContainerRef, panZoomer] = usePanZoom({
    initialScale: ZOOM_SCALE_INITIAL,
    minScale: ZOOM_SCALE_MIN,
    maxScale: ZOOM_SCALE_MAX,
    onChange: onPanZoomed,
  })

  const fillRectProps = {
    x: viewBox[0],
    y: viewBox[1],
    width: viewBox[2],
    height: viewBox[3],
  }

  return (
    <div pos="absolute top-0 right-0 bottom-0 left-0" overflow="hidden">
      <svg w="full" h="full">
        <g ref={renderContainerRef}>
          <svg
            {...BASE_IMAGE_PROPS}
            viewBox={viewBox.join(' ')}
            overflow="visible"
          >
            <defs>
              <mask id="drill-mask">
                <rect fill="#fff" {...fillRectProps} />
                {mechanicalLayers.drill.map(id => (
                  <g
                    key={id}
                    color="#000"
                    dangerouslySetInnerHTML={{__html: svgFragmentsById[id]}}
                  />
                ))}
              </mask>
              <mask id="resist-mask">
                <rect fill="#fff" {...fillRectProps} />
                {bottomLayers.solderMask.map(id => (
                  <g
                    key={id}
                    color="#000"
                    dangerouslySetInnerHTML={{__html: svgFragmentsById[id]}}
                  />
                ))}
              </mask>
              {outlineSvgFragment ? (
                <clipPath
                  id="outline-clip"
                  dangerouslySetInnerHTML={{__html: outlineSvgFragment}}
                />
              ) : null}
            </defs>
            <g
              transform={`translate(${
                2 * fillRectProps.x + fillRectProps.width
              },0) scale(-1,1)`}
              clipPath={outlineSvgFragment ? 'url(#outline-clip)' : undefined}
            >
              <g mask="url(#drill-mask)">
                <rect fill="#666" {...fillRectProps} />
                {bottomLayers.copper.map(id => (
                  <g
                    key={id}
                    color="#cc9933"
                    dangerouslySetInnerHTML={{__html: svgFragmentsById[id]}}
                  />
                ))}
              </g>
              <g mask="url(#resist-mask)">
                {bottomLayers.solderMask.length > 0 ? (
                  <rect fill="#004200" opacity="0.8" {...fillRectProps} />
                ) : null}
                {bottomLayers.silkScreen.map(id => (
                  <g
                    key={id}
                    color="white"
                    dangerouslySetInnerHTML={{__html: svgFragmentsById[id]}}
                  />
                ))}
              </g>
              {bottomLayers.solderPaste.map(id => (
                <g
                  key={id}
                  color="#999"
                  dangerouslySetInnerHTML={{__html: svgFragmentsById[id]}}
                />
              ))}
            </g>
            {layers.map(({id, side, type}) => (
              <g
                key={`layer-${id}`}
                data-side={side}
                data-type={type}
                opacity="0.5"
                dangerouslySetInnerHTML={{__html: svgFragmentsById[id]}}
              />
            ))}
          </svg>
        </g>
      </svg>
      <PanZoomControls zoomTo={panZoomer?.zoomTo.bind(panZoomer)} />
    </div>
  )
}

function PanZoomControls(props: {
  zoomTo?: (scale: number) => unknown
}): JSX.Element | null {
  const scale = useZoomScale()

  if (scale === undefined) {
    return null
  }

  return (
    <div
      pos="absolute bottom-32 left-1/2"
      transform="~ -translate-x-1/2"
      m="x-auto"
      w="64"
    >
      <LogSlider
        value={scale}
        valueText={`${scale * 100}%`}
        min={ZOOM_SCALE_MIN}
        max={ZOOM_SCALE_MAX}
        onChange={nextScale => props.zoomTo?.(nextScale)}
        w="full"
      />
    </div>
  )
}
