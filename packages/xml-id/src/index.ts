// Tracespace xml id utilities

// subset of characters that are XML ID, CSS identifier, and URL friendly
const START_CHAR = '_ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz'
const CHAR = `-0123456789${START_CHAR}`
const REPLACE_RE = new RegExp(`^[^${START_CHAR}]|[^\\${CHAR}]`, 'g')

const DEFAULT_RANDOM_LENGTH = 12

export function random(length: number = DEFAULT_RANDOM_LENGTH): string {
  length = length || DEFAULT_RANDOM_LENGTH
  return _getRandomString(1, START_CHAR) + _getRandomString(length - 1, CHAR)
}

export function sanitize(source: string): string {
  return source.replace(REPLACE_RE, '_')
}

export function ensure(
  maybeId: unknown,
  length: number = DEFAULT_RANDOM_LENGTH
): string {
  return typeof maybeId === 'string' ? sanitize(maybeId) : random(length)
}

function _getRandomString(length: number, alphabet: string): string {
  const abLength = alphabet.length
  let result = ''

  while (length > 0) {
    length--
    result += alphabet[Math.floor(Math.random() * abLength)]
  }

  return result
}
