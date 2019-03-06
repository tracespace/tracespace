// tracespace components library
import React from 'react'

import {SvgSource} from '../types'

export type SvgRenderProps = {
  source: SvgSource
  className?: string
}

export const SvgRender = React.memo(_SvgRender)

function _SvgRender(props: SvgRenderProps): JSX.Element | null {
  const {source, className} = props

  return source ? (
    <div className={className} dangerouslySetInnerHTML={{__html: source}} />
  ) : null
}
