import React from 'react'

import {Slide} from './animation'
import {Button} from './buttons'
import {Icon} from './Icon'

const STYLE =
  'fixed top-1 right-1 z-2 w-25 nt2 nr2 pv2 ph3 br3 near-black bg-white shadow'
const TITLE_BAR_STYLE = 'flex items-center mb3'
const TITLE_STYLE = 'mr-auto f3 lh-title mv0 normal'
const BUTTON_STYLE = 'flex-none nr2 f4'

export type DrawerProps = {
  title: string
  open: boolean
  children: React.ReactNode
  close: () => unknown
}

export function Drawer(props: DrawerProps): JSX.Element {
  const {title, open, children, close} = props

  return (
    <Slide in={open} from="right">
      <section className={STYLE}>
        <div className={TITLE_BAR_STYLE}>
          <h2 className={TITLE_STYLE}>{title}</h2>
          <Button onClick={close} className={BUTTON_STYLE}>
            <Icon name="times" />
          </Button>
        </div>
        {children}
      </section>
    </Slide>
  )
}
