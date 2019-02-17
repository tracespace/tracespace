import React from 'react'

import {LayerRender} from '../types'
import FileItem from './FileItem'

type Props = {
  label: string
  layers: Array<LayerRender>
  showFilenames: boolean
}

export default function SideList(props: Props): JSX.Element | null {
  const {label, layers, showFilenames} = props
  if (layers.length === 0) return null

  return (
    <li>
      <h3 className="mv2 pl3 lh-title f5 b">{label}</h3>
      <ul className="list pl0 mv0 near-black">
        {layers.map(layer => (
          <FileItem key={layer.id} {...layer} showFilenames={showFilenames} />
        ))}
      </ul>
    </li>
  )
}
