import React from 'react'
import {CSSTransition} from 'react-transition-group'

type AnimationProps = {
  in: boolean | string | null | undefined
  children: React.ReactNode
}

export type FadeProps = AnimationProps

const FADE_STYLE = 'fade'

export function Fade(props: AnimationProps): JSX.Element {
  return (
    <CSSTransition
      in={Boolean(props.in)}
      classNames={FADE_STYLE}
      timeout={500}
      mountOnEnter
      unmountOnExit
    >
      {props.children}
    </CSSTransition>
  )
}

export type SlideProps = AnimationProps & {
  from: 'top' | 'bottom' | 'left' | 'right'
}

const SLIDE_STYLE = 'slide'

export function Slide(props: SlideProps): JSX.Element {
  return (
    <CSSTransition
      in={Boolean(props.in)}
      classNames={`${SLIDE_STYLE}-${props.from}`}
      timeout={500}
      mountOnEnter
      unmountOnExit
    >
      {props.children}
    </CSSTransition>
  )
}
