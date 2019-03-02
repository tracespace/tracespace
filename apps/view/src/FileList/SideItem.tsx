import React from 'react'

import {LayerRender} from '../types'
import FileItem from './FileItem'

type Props = {
  label: string
  layers: Array<LayerRender>
  showFilenames: boolean
}

const HEADING_STYLE = 'mv2 pl3 lh-title f5 b'
const SUBLIST_STYLE = 'list pl0 mv0 near-black'

export default function SideList(props: Props): JSX.Element | null {
  const {label, layers, showFilenames} = props
  if (layers.length === 0) return null

  return (
    <li>
      <h3 className={HEADING_STYLE}>{label}</h3>
      <ul className={SUBLIST_STYLE}>
        {layers.map(layer => (
          <FileItem key={layer.id} {...layer} showFilenames={showFilenames} />
        ))}
      </ul>
    </li>
  )
}
