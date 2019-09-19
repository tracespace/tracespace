'use strict'

const assert = require('assert')
const path = require('path')
const fs = require('fs')
const untildify = require('untildify')
const {createParser} = require('@tracespace/parser')
const {createBoard} = require('@tracespace/plotter')
const {renderLayer} = require('@tracespace/renderer')
const hastToHtml = require('hast-util-to-html')

const filename = process.argv[2]

assert(filename, `USAGE: node scripts/render-file <filename>`)

const filepath = path.resolve(process.cwd(), untildify(filename))
const contents = fs.readFileSync(filepath, 'utf8')
const parser = createParser()

parser.feed(contents)

const parseTree = parser.results()
const layer = {filename, tree: parseTree}
const board = createBoard([layer])
const render = renderLayer(board.layers[0])

console.warn(JSON.stringify(render, null, 2))
console.log(hastToHtml(render.svgRender, {closeEmptyElements: true}))
