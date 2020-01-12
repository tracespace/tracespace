// @tracespace/view entry point
import React from 'react'
import './styles'

// @ts-ignore: https://github.com/microsoft/TypeScript/issues/33752
Promise.all([
  import('react-dom'),
  import('./App'),
  import('./state/StoreProvider'),
]).then((imports: any) => {
  const [
    {default: ReactDom},
    {default: App},
    {default: StoreProvider},
  ] = imports

  ReactDom.hydrate(
    <StoreProvider>
      <App />
    </StoreProvider>,
    document.querySelector('[data-hook=root]')
  )
})
