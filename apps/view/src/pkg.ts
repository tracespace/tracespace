const VERSION = process.env.PKG_VERSION || '0.0.0-version-error'
const REPOSITORY_URL = process.env.PKG_REPOSITORY_URL || ''
const AUTHOR_NAME = process.env.PKG_AUTHOR_NAME || ''
const AUTHOR_URL = process.env.PKG_AUTHOR_URL || '#'

const REPO_URL_MATCH = REPOSITORY_URL.match(/git\+(https:\/\/.+).git/)
const REPO_URL = REPO_URL_MATCH ? REPO_URL_MATCH[1] : '#'
const CONTRIBUTORS_URL = `${REPO_URL}/graphs/contributors`
const PRIVACY_URL = `${REPO_URL}/blob/v${VERSION}/PRIVACY.md`

export {
  VERSION,
  AUTHOR_NAME,
  AUTHOR_URL,
  REPO_URL,
  CONTRIBUTORS_URL,
  PRIVACY_URL,
}
