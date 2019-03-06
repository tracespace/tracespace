import React from 'react'
import cx from 'classnames'

export type ButtonProps = {
  onClick?: React.MouseEventHandler<HTMLButtonElement>
  disabled?: boolean
  className?: string
  children?: React.ReactNode
  title?: string
  type?: 'button' | 'submit' | 'reset'
}

export const BUTTON_CLASSNAME = 'bn pa0 br2 color-inherit bg-transparent'

export function getButtonStyle(props: ButtonProps): string {
  return cx(
    {
      'o-40': props.disabled,
      'pointer bg-animate hover-bg-black-20': !props.disabled,
    },
    BUTTON_CLASSNAME,
    props.className
  )
}

export function Button(props: ButtonProps): JSX.Element {
  const {onClick, title, children} = props
  const type = props.type || 'button'
  const disabled = Boolean(props.disabled)
  const className = getButtonStyle(props)

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={className}
      title={title}
      suppressHydrationWarning={true}
    >
      {children}
    </button>
  )
}
