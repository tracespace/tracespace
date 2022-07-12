// Tests for the ToolStore interface
import {describe, it, expect} from 'vitest'

import * as Parser from '@tracespace/parser'

import {SIMPLE_TOOL, MACRO_TOOL, createToolStore} from '../tool-store'

describe('tool state store', () => {
  it('should handle tool definitions', () => {
    const toolDefinition: Parser.ToolDefinition = {
      type: Parser.TOOL_DEFINITION,
      code: '42',
      shape: {type: 'circle', diameter: 42},
      hole: null,
    }

    const subject = createToolStore()
    const result = subject.use(toolDefinition)

    expect(result).to.eql({
      type: SIMPLE_TOOL,
      shape: {type: 'circle', diameter: 42},
    })
  })

  it('should handle a tool change after a tool definition', () => {
    const tool1: Parser.ToolDefinition = {
      type: Parser.TOOL_DEFINITION,
      code: '1',
      shape: {type: 'circle', diameter: 1},
      hole: null,
    }
    const tool2: Parser.ToolDefinition = {
      type: Parser.TOOL_DEFINITION,
      code: '2',
      shape: {type: 'circle', diameter: 2},
      hole: null,
    }
    const toolChange: Parser.ToolChange = {
      type: Parser.TOOL_CHANGE,
      code: '1',
    }

    const subject = createToolStore()

    expect(subject.use(tool1)).to.eql({
      type: SIMPLE_TOOL,
      shape: {type: 'circle', diameter: 1},
    })
    expect(subject.use(tool2)).to.eql({
      type: SIMPLE_TOOL,
      shape: {type: 'circle', diameter: 2},
    })
    expect(subject.use(toolChange)).to.eql({
      type: SIMPLE_TOOL,
      shape: {type: 'circle', diameter: 1},
    })
  })

  it('should keep track of the current tool', () => {
    const comment: Parser.Comment = {
      type: Parser.COMMENT,
      comment: 'hello world',
    }
    const tool: Parser.ToolDefinition = {
      type: Parser.TOOL_DEFINITION,
      code: '42',
      shape: {type: 'circle', diameter: 42},
      hole: null,
    }

    const subject = createToolStore()

    expect(subject.use(comment)).to.equal(undefined)
    expect(subject.use(tool)).to.eql({
      type: SIMPLE_TOOL,
      shape: {type: 'circle', diameter: 42},
    })
    expect(subject.use(comment)).to.eql({
      type: SIMPLE_TOOL,
      shape: {type: 'circle', diameter: 42},
    })
  })

  it('should track tool macros', () => {
    const macro: Parser.ToolMacro = {
      type: Parser.TOOL_MACRO,
      name: 'cool-macro',
      children: [{type: Parser.MACRO_COMMENT, comment: 'hello world'}],
    }
    const tool: Parser.ToolDefinition = {
      type: Parser.TOOL_DEFINITION,
      code: '42',
      shape: {
        type: Parser.MACRO_SHAPE,
        name: 'cool-macro',
        variableValues: [1, 2, 3],
      },
      hole: null,
    }

    const subject = createToolStore()

    expect(subject.use(macro)).to.equal(undefined)
    expect(subject.use(tool)).to.eql({
      type: MACRO_TOOL,
      macro: [{type: Parser.MACRO_COMMENT, comment: 'hello world'}],
      variableValues: [1, 2, 3],
    })
  })
})
