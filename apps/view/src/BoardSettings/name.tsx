import React from 'react'

import {FieldProps} from './types'

const BASE_STYLE = 'f3 lh-title normal tc'
const STYLE = `${BASE_STYLE} mv0 mh2`
const INPUT_STYLE = `${BASE_STYLE} mb3 bb bt-0 br-0 bl-0 b--near-black`

export function BoardName(props: {children: React.ReactNode}): JSX.Element {
  return <h2 className={STYLE}>{props.children}</h2>
}

export function BoardNameInput(props: FieldProps): JSX.Element {
  return (
    <input
      type="text"
      className={INPUT_STYLE}
      autoComplete="off"
      data-lpignore="true"
      {...props.field}
    />
  )
}
