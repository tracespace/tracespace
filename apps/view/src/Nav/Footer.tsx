import React from 'react'

const HREF_AUTHOR = 'https://mike.cousins.io'
const HREF_CONTRIBUTORS =
  'https://github.com/tracespace/tracespace/graphs/contributors'
const HREF_REPO = 'https://github.com/tracespace/tracespace'
const HREF_PRIVACY =
  'https://github.com/tracespace/tracespace/blob/next/PRIVACY.md'

const COPY_STYLE = 'mv0 lh-copy f7 white'
const LINK_STYLE = 'link dim near-black'

export default function Footer(): JSX.Element {
  return (
    <footer className="fixed right-1 bottom-1 w-third tr">
      <p className={COPY_STYLE}>
        {'© '}2015 - 2019 by{' '}
        <a href={HREF_AUTHOR} className={LINK_STYLE}>
          mike cousins
        </a>{' '}
        and{' '}
        <a href={HREF_CONTRIBUTORS} className={LINK_STYLE}>
          contributors
        </a>
      </p>
      <p className={COPY_STYLE}>
        <a href={HREF_PRIVACY} className={LINK_STYLE}>
          privacy policy
        </a>
        {' | '}
        <a href={HREF_REPO} className={LINK_STYLE}>
          view source
        </a>
      </p>
    </footer>
  )
}
