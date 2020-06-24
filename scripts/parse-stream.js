// temporary testing script
'use strict'

const assert = require('assert')
const path = require('path')
const fs = require('fs')
const untildify = require('untildify')
const {createParser} = require('@tracespace/parser')

const filename = process.argv[2]

assert(filename, `USAGE: node scripts/parse-stream <filename>`)

const filepath = path.resolve(process.cwd(), untildify(filename))
const input = fs.createReadStream(filepath, 'utf8')

parseGerberStream(input)
  .then(results => console.log(JSON.stringify(results)))
  .catch(error => console.error(error))

function parseGerberStream(inputStream) {
  const parser = createParser()
  const handleData = data => parser.feed(data)

  inputStream.on('data', handleData)

  return new Promise((resolve, reject) => {
    inputStream.once('error', handleError)
    inputStream.once('end', handleEnd)

    function handleEnd() {
      cleanup()
      resolve(parser.results())
    }

    function handleError(error) {
      cleanup()
      reject(error)
    }

    function cleanup() {
      inputStream.off('data', handleData)
      inputStream.off('end', handleEnd)
      inputStream.off('error', handleError)
    }
  })
}
