// Tool store
// Keeps track of the defined tools, defined macros, and the current tool
import {
  MACRO_SHAPE,
  TOOL_CHANGE,
  TOOL_DEFINITION,
  TOOL_MACRO,
  Child,
  SimpleShape,
  HoleShape,
  MacroShape,
  MacroBlock,
} from '@tracespace/parser'

export interface SimpleTool {
  shape: SimpleShape
  hole?: HoleShape
}

export interface MacroTool {
  shape: MacroShape
  macro: MacroBlock[]
}

export type Tool = SimpleTool | MacroTool

export interface ToolStore {
  use(node: Child): Tool | undefined
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

  use(node: Child): Tool | undefined {
    if (node.type === TOOL_MACRO) {
      this._macrosByName[node.name] = node.children
    }

    if (node.type === TOOL_DEFINITION) {
      const {shape, hole} = node
      const tool =
        shape.type === MACRO_SHAPE
          ? {shape, macro: this._macrosByName[shape.name] ?? []}
          : {shape, ...(hole && {hole})}

      this._toolsByCode[node.code] = tool
    }

    if (node.type === TOOL_DEFINITION || node.type === TOOL_CHANGE) {
      this._currentToolCode = node.code
    }

    return typeof this._currentToolCode === 'string'
      ? this._toolsByCode[this._currentToolCode]
      : undefined
  },
}
