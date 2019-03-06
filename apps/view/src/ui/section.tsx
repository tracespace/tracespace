import React from 'react'

export type TitledSectionProps = {
  title: string
  children: React.ReactNode
}

export function TitledSection(props: TitledSectionProps): JSX.Element {
  const {title, children} = props

  return (
    <section className="tl mb4">
      <h3 className="mt0 mb2 f5 lh-title b">{title}</h3>
      {children}
    </section>
  )
}

export function SectionColumnLeft(props: {
  children: React.ReactNode
}): JSX.Element {
  return <div className="dib w-50 pr3 v-top br">{props.children}</div>
}

export function SectionColumnRight(props: {
  children: React.ReactNode
}): JSX.Element {
  return <div className="dib w-50 pl3 v-top">{props.children}</div>
}
