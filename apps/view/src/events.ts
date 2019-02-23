// event handling helpers

import {SyntheticEvent} from 'react'

export function preventDefault(event: SyntheticEvent | Event): void {
  event.preventDefault()
}

export function stopPropagation(event: SyntheticEvent | Event): void {
  event.stopPropagation()
}

export function select(event: SyntheticEvent<HTMLInputElement>): void {
  event.currentTarget.select()
}
