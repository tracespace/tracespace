import type {AttributifyAttributes} from 'windicss/types/jsx'

declare module 'windicss/types/jsx' {
  type MissingAttributes = 'sr' | 'pointer'

  interface AttributifyAttributes
    extends Partial<Record<MissingAttributes, string>> {}
}

declare module 'preact' {
  namespace JSX {
    interface HTMLAttributes extends AttributifyAttributes {}
  }
}
