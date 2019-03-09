import React from 'react'

import pkg from './../../package.json'

const REPO_URL_MATCH = pkg.repository.url.match(/git\+(https:\/\/.+).git/)
const REPO_URL = REPO_URL_MATCH ? REPO_URL_MATCH[1] : '#'

const {name: AUTHOR_NAME, url: AUTHOR_URL} = pkg.author
const CONTRIBUTORS_URL = `${REPO_URL}/graphs/contributors`
const PRIVACY_URL = `${REPO_URL}/blob/v${pkg.version}/PRIVACY.md`

const STYLE = 'fixed right-1 bottom-1 w-third tr'
const COPY_STYLE = 'mv0 lh-copy f7 white'
const LINK_STYLE = 'link dim fw3 lightest-blue'

export default function Footer(): JSX.Element {
  return (
    <footer className={STYLE}>
      <p className={COPY_STYLE}>
        {'© 2015 - 2019 by '}
        <a href={AUTHOR_URL} className={LINK_STYLE}>
          {AUTHOR_NAME.toLowerCase()}
        </a>{' '}
        {'and '}
        <a href={CONTRIBUTORS_URL} className={LINK_STYLE}>
          contributors
        </a>
      </p>
      <p className={COPY_STYLE}>
        <a href={PRIVACY_URL} className={LINK_STYLE}>
          privacy policy
        </a>
        {' | '}
        <a href={REPO_URL} className={LINK_STYLE}>
          view source
        </a>
      </p>
    </footer>
  )
}
