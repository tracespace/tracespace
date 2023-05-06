// Tool store
// Keeps track of the defined tools, defined macros, and the current tool
import type {
  GerberNode,
  SimpleShape,
  HoleShape,
  MacroBlock,
} from '@tracespace/parser'
import {
  MACRO_SHAPE,
  TOOL_CHANGE,
  TOOL_DEFINITION,
  TOOL_MACRO,
} from '@tracespace/parser'

export const SIMPLE_TOOL = 'simpleTool'

export const MACRO_TOOL = 'macroTool'

export interface SimpleTool {
  type: typeof SIMPLE_TOOL
  shape: SimpleShape
  dcode: string
  hole: HoleShape | undefined
}

export interface MacroTool {
  type: typeof MACRO_TOOL
  name: string
  dcode: string
  macro: MacroBlock[]
  variableValues: number[]
}

export type Tool = SimpleTool | MacroTool

export interface ToolStore {
  _toolsByCode: Partial<Record<string, Tool>>
  _macrosByName: Partial<Record<string, MacroBlock[]>>
  use: (node: GerberNode) => Tool | undefined
}

export function createToolStore(): ToolStore {
  return Object.create(ToolStorePrototype)
}

interface ToolStoreState {
  _currentToolCode: string | undefined
  _toolsByCode: Partial<Record<string, Tool>>
  _macrosByName: Partial<Record<string, MacroBlock[]>>
}

const ToolStorePrototype: ToolStore & ToolStoreState = {
  _currentToolCode: undefined,
  _toolsByCode: {},
  _macrosByName: {},

  use(node: GerberNode): Tool | undefined {
    if (node.type === TOOL_MACRO) {
      this._macrosByName[node.name] = node.children
    }

    if (node.type === TOOL_DEFINITION) {
      const {code, shape, hole} = node
      const tool: Tool =
        shape.type === MACRO_SHAPE
          ? {
              type: MACRO_TOOL,
              name: shape.name,
              dcode: code,
              macro: this._macrosByName[shape.name] ?? [],
              variableValues: shape.variableValues,
            }
          : {type: SIMPLE_TOOL, dcode: code, shape, hole: hole ?? undefined}

      this._toolsByCode[code] = tool
    }

    if (node.type === TOOL_DEFINITION || node.type === TOOL_CHANGE) {
      this._currentToolCode = node.code
    }

    return typeof this._currentToolCode === 'string'
      ? this._toolsByCode[this._currentToolCode]
      : undefined
  },
}
