import assert from 'node:assert'
import {readFile, writeFile} from 'node:fs/promises'
import path from 'node:path'
import process from 'node:process'

import {options} from '@tracespace/cli'

const argv = process.argv.slice(2)

const startMatch = sec => `<!-- insert:${argv[1]}:${sec} -->`
const endMatch = sec => `<!-- endinsert:${argv[1]}:${sec} -->`
const matcher = sec =>
  new RegExp(`(${startMatch(sec)}\n)[\\s\\S]*(\n${endMatch(sec)})`, 'm')

assert(argv[0], `expected first argument to be the path to a markdown file`)
assert(argv[1], `expected second argument to be the insertion marker`)

const doc = path.resolve(process.cwd(), argv[0])

readFile(doc, 'utf8')
  .then(insertOptionsIntoDocument)
  .then(writeDocs)
  .then(
    () => {
      console.log(`Wrote ${doc}`)
      process.exitCode = 0
    },
    error => {
      console.error(error)
      process.exitCode = 1
    }
  )

function insertOptionsIntoDocument(contents) {
  return contents.replace(
    matcher('options'),
    (_match, startTag, endTag) => `${startTag}${generateOptions()}\n${endTag}`
  )
}

function writeDocs(contents) {
  return writeFile(doc, contents, 'utf8')
}

function generateOptions() {
  return Object.keys(options)
    .map(long => {
      const {
        describe,
        example,
        type = 'object',
        alias: short,
        default: defaultValue,
      } = options[long]

      return `
#### \`-${short}\`, \`--${long}\`, \`config.${long}\`

- Type: \`${type}\`
- Default: \`${defaultValue || getDefaultFromType(type)}\`
- Description: ${describe}
${example.aside ? `\n> ${example.aside}\n` : ''}
\`\`\`shell
# ${example.desc}
${example.cmd.replace('$0', 'tracespace')}
\`\`\``
    })
    .join('\n')
}

function getDefaultFromType(type) {
  if (type === 'boolean') {
    return 'false'
  }

  return 'undefined'
}
