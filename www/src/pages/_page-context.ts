import type {ComponentType} from 'preact'
import type {PageContextBuiltInClient} from 'vite-plugin-ssr/client/router'

export interface PageContext extends PageContextBuiltInClient {
  Page: ComponentType
}
