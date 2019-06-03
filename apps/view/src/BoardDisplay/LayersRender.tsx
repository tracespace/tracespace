import React from 'react'
import cx from 'classnames'
import vb, {ViewBox} from 'viewbox'

import {LayerRender, LayerVisibilityMap} from '../types'

type Props = {
  layers: Array<LayerRender>
  layerVisibility: LayerVisibilityMap
  viewBox: ViewBox
  className?: string
}

export function LayersRender(props: Props): JSX.Element {
  const {layerVisibility, viewBox, className} = props
  const layers = props.layers.filter(ly => ly.converter.layer.length > 0)

  return (
    <svg
      className={cx(className, 'overflow-visible')}
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth="0"
      fillRule="evenodd"
      viewBox={vb.asString(viewBox)}
    >
      {layers.map(ly => (
        <defs
          key={ly.id}
          dangerouslySetInnerHTML={{__html: ly.converter.defs.join('')}}
        />
      ))}
      <g transform={`translate(0,${viewBox[3] + 2 * viewBox[1]}) scale(1, -1)`}>
        {layers.map(ly => {
          const {converter, scale} = ly
          const groupProps: React.SVGProps<SVGGElement> = {
            id: ly.id,
            dangerouslySetInnerHTML: {__html: converter.layer.join('')},
          }

          if (scale !== 1) groupProps.transform = `scale(${scale})`

          return (
            <g
              key={ly.id}
              fill={ly.color}
              stroke={ly.color}
              className={layerVisibility[ly.id] ? 'o-40' : 'o-0'}
            >
              <g {...groupProps} />
            </g>
          )
        })}
      </g>
    </svg>
  )
}

export default React.memo(LayersRender)
