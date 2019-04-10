import pkg from '../package.json'

const REPO_URL_MATCH = pkg.repository.url.match(/git\+(https:\/\/.+).git/)

export const REPO_URL = REPO_URL_MATCH ? REPO_URL_MATCH[1] : '#'
export const {name: AUTHOR_NAME, url: AUTHOR_URL} = pkg.author
export const CONTRIBUTORS_URL = `${REPO_URL}/graphs/contributors`
export const PRIVACY_URL = `${REPO_URL}/blob/v${pkg.version}/PRIVACY.md`
