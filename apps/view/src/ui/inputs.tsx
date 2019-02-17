import React from 'react'
import cx from 'classnames'

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
