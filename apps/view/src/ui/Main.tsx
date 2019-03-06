import React from 'react'

export type MainProps = {
  children: React.ReactNode
  onDragOver: (event: React.DragEvent<HTMLMainElement>) => void
  onDrop: (event: React.DragEvent<HTMLMainElement>) => void
}

const STYLE = 'sans relative overflow-hidden h-100 pa3 white bg-gradient'

export function Main(props: MainProps): JSX.Element {
  const {children, onDragOver, onDrop} = props

  return (
    <main className={STYLE} onDragOver={onDragOver} onDrop={onDrop}>
      {children}
    </main>
  )
}
