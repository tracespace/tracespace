// factories to generate all possible parsed by a gerber command
'use strict'

var done = function() {
  return {type: 'done', line: -1}
}

var set = function(property, value) {
  return {type: 'set', line: -1, prop: property, value: value}
}

var level = function(level, value) {
  return {type: 'level', line: -1, level: level, value: value}
}

var tool = function(code, tool) {
  return {type: 'tool', line: -1, code: code, tool: tool}
}

var op = function(operation, location) {
  return {type: 'op', line: -1, op: operation, coord: location}
}

var macro = function(name, blocks) {
  return {type: 'macro', line: -1, name: name, blocks: blocks}
}

var commandMap = {
  set: set, done: done, level: level, tool: tool, op: op, macro: macro
}
module.exports = commandMap
