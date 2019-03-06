import React from 'react'
import cx from 'classnames'
import contrast from 'contrast'

export type ColorPillProps = {
  color: string
  className?: string
}

export function ColorPill(props: ColorPillProps): JSX.Element {
  const color = props.color.slice(0, 7)
  const dark = contrast(color) === 'dark'
  const className = cx(
    'border-box flex-none pv1 ph2 br-pill code f6',
    dark ? 'white' : 'near-black ba',
    props.className
  )
  const style = {backgroundColor: color}

  return (
    <span className={className} style={style}>
      {color}
    </span>
  )
}
