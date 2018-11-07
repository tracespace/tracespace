// factories to generate all possible parsed by a gerber command
'use strict'

var done = function(line) {
  return {type: 'done', line: line || -1}
}

var set = function(property, value, line) {
  return {type: 'set', line: line || -1, prop: property, value: value}
}

var level = function(level, value, line) {
  return {type: 'level', line: line || -1, level: level, value: value}
}

var tool = function(code, tool, line) {
  return {type: 'tool', line: line || -1, code: code, tool: tool}
}

var op = function(operation, location, line) {
  return {type: 'op', line: line || -1, op: operation, coord: location}
}

var macro = function(name, blocks, line) {
  return {type: 'macro', line: line || -1, name: name, blocks: blocks}
}

var commandMap = {
  set: set,
  done: done,
  level: level,
  tool: tool,
  op: op,
  macro: macro,
}
module.exports = commandMap
