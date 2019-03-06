// @tracespace/view entry point
import React from 'react'
import './styles'

Promise.all([
  import('react-dom'),
  import('./state/StateProvider'),
  import('./App'),
]).then(imports => {
  const [
    {default: ReactDom},
    {default: StateProvider},
    {default: App},
  ] = imports

  ReactDom.hydrate(
    <StateProvider>
      <App />
    </StateProvider>,
    document.querySelector('[data-hook=root]')
  )
})
