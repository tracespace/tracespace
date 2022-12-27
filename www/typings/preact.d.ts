import 'preact'

declare module 'preact' {
  namespace JSX {
    interface HTMLAttributes {
      color?: string
    }
  }
}
