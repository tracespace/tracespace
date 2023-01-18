import '@fontsource/open-sans/variable.css'
import 'virtual:windi.css'
import 'virtual:windi-devtools' // eslint-disable-line import/no-unassigned-import

import {hydrate as preactHydrate, render as preactRender} from 'preact'

import type {PageContext} from './_page-context'

export const clientRouting = true

export function render(pageContext: PageContext): void {
  const {Page, isHydration} = pageContext
  const page = <Page />
  const mount = isHydration ? preactHydrate : preactRender

  mount(page, document.body)
}
