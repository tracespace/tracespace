import React from 'react'
import cx from 'classnames'

import {Icon} from './Icon'

export type LabelProps = {
  className?: string
  disabled?: boolean
  children: React.ReactNode
} & React.LabelHTMLAttributes<HTMLLabelElement>

export const LABEL_CLASSNAME = 'flex items-center'

export function Label(props: LabelProps): JSX.Element {
  const {className, disabled, children, ...rest} = props
  const style = cx(LABEL_CLASSNAME, className, {pointer: !disabled})

  return (
    <label className={style} {...rest}>
      {children}
    </label>
  )
}

export type InputProps = React.InputHTMLAttributes<HTMLInputElement>

export function HiddenInput(props: InputProps): JSX.Element {
  return <input className="clip" {...props} />
}

export function Checkbox(props: InputProps): JSX.Element {
  const {className, children, ...inputProps} = props
  const iconName = props.value ? 'check-square' : 'square'

  return (
    <Label className={className}>
      <HiddenInput type="checkbox" {...inputProps} />
      <Icon className="nl2" name={iconName} />
      {children}
    </Label>
  )
}
