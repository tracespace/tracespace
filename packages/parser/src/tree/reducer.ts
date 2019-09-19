// ensure that one child of given type exists in a parent node
// modifies and returns tree
import * as Lexer from '../lexer'
import * as Grammar from '../grammar'
import * as Nodes from './nodes'
import {parseMacroDefinition} from './parse-macros'

type ReducerMatch = Grammar.GrammarMatch<Grammar.GrammarRuleType>

export function reducer(tree: Nodes.Root, match: ReducerMatch): Nodes.Root {
  const [header, image] = tree.children
  const {type: matchType, tokens, filetype} = match

  if (filetype && !tree.filetype) tree.filetype = filetype

  switch (matchType) {
    case Grammar.GERBER_COMMENT:
    case Grammar.DRILL_COMMENT: {
      const value = tokens
        .slice(1, -1)
        .map(t => t.value)
        .join('')
        .trim()

      const target = image.children.length > 0 ? image : header
      target.children.push({type: Nodes.COMMENT, value})
      break
    }

    case Grammar.GERBER_UNITS: {
      const units = tokens[1].value === 'MM' ? 'mm' : 'in'
      header.children.push({type: Nodes.UNITS, units})
      break
    }

    case Grammar.GERBER_FORMAT: {
      let zeroSuppression = null
      let format = null
      let mode = null

      tokens.forEach(token => {
        if (token.type === Lexer.GERBER_FORMAT) {
          if (token.value.indexOf('T') >= 0) zeroSuppression = 'trailing'
          if (token.value.indexOf('L') >= 0) zeroSuppression = 'leading'
          if (token.value.indexOf('I') >= 0) mode = 'incremental'
          if (token.value.indexOf('A') >= 0) mode = 'absolute'
        } else if (token.type === Lexer.NUMBER && token.value.length === 2) {
          const integers = Number(token.value[0])
          const decimals = Number(token.value[1])
          if (integers && decimals) format = [integers, decimals]
        }
      })

      if (format || zeroSuppression || mode) {
        header.children.push({
          type: Nodes.COORDINATE_FORMAT,
          format,
          zeroSuppression,
          mode,
        })
      }
      break
    }

    case Grammar.DRILL_UNITS: {
      let units = null
      let zeroSuppression = null
      let format = null

      tokens.forEach(token => {
        if (token.type === Lexer.DRILL_UNITS) {
          units = token.value === 'METRIC' ? Nodes.MM : Nodes.IN
        } else if (token.type === Lexer.M_CODE) {
          units = token.value === '71' ? Nodes.MM : Nodes.IN
        } else if (token.type === Lexer.DRILL_ZERO_INCLUSION) {
          zeroSuppression =
            token.value === 'TZ' ? Nodes.LEADING : Nodes.TRAILING
        } else if (token.type === Lexer.NUMBER) {
          const [integer, decimal] = token.value.split('.')
          format = [integer.length, decimal.length]
        }
      })

      if (units) header.children.push({type: Nodes.UNITS, units})

      if (format || zeroSuppression) {
        header.children.push({
          type: Nodes.COORDINATE_FORMAT,
          mode: null,
          format,
          zeroSuppression,
        })
      }
      break
    }

    case Grammar.GERBER_TOOL_DEFINITION: {
      const toolProps = tokens[1].value.match(/(\d+)(.+)/) || []
      // this should never happen, but for safety
      if (toolProps === null) return tree

      const [, code, name] = toolProps
      const params: Array<number> = tokens
        .slice(3)
        .filter(t => t.type === Lexer.NUMBER)
        .map(t => Number(t.value))

      let shape: Nodes.ToolShape | null = null
      let hole: Nodes.HoleShape = null
      let holeParams: Array<number> = []

      if (name === 'C') {
        const [diameter, ...rest] = params
        shape = {type: Nodes.CIRCLE, diameter}
        holeParams = rest
      } else if (name === 'R' || name === 'O') {
        const [xSize, ySize, ...rest] = params
        shape =
          name === 'R'
            ? {type: Nodes.RECTANGLE, xSize, ySize}
            : {type: Nodes.OBROUND, xSize, ySize}
        holeParams = rest
      } else if (name === 'P') {
        const [diameter, vertices, rotation = null, ...rest] = params
        shape = {type: Nodes.POLYGON, diameter, vertices, rotation}
        holeParams = rest
      } else {
        // macro time
        shape = {type: Nodes.MACRO_SHAPE, name, params}
        holeParams = []
      }

      if (holeParams.length === 1) {
        const [diameter] = holeParams
        hole = {type: Nodes.CIRCLE, diameter}
      } else if (holeParams.length === 2) {
        const [xSize, ySize] = holeParams
        hole = {type: Nodes.RECTANGLE, xSize, ySize}
      }

      if (shape) {
        header.children.push({
          type: Nodes.TOOL_DEFINITION,
          code,
          shape,
          hole,
        })
      }
      break
    }

    case Grammar.GERBER_TOOL_MACRO: {
      header.children.push(parseMacroDefinition(tokens))
      break
    }

    case Grammar.DRILL_TOOL_DEFINITION: {
      const code = tokens[0].value
      const hole = null
      const shape: Nodes.ToolShape = {
        type: Nodes.CIRCLE,
        diameter: Number(tokens[1].value.slice(1)),
      }

      header.children.push({
        type: Nodes.TOOL_DEFINITION,
        hole,
        code,
        shape,
      })
      break
    }

    case Grammar.GERBER_TOOL_CHANGE: {
      const codeToken = tokens.find(t => t.type === Lexer.D_CODE)
      if (codeToken) {
        const node: Nodes.ToolChange = {
          type: Nodes.TOOL_CHANGE,
          code: codeToken.value,
        }
        image.children.push(node)
      }
      break
    }

    case Grammar.DRILL_TOOL_CHANGE: {
      const node: Nodes.ToolChange = {
        type: Nodes.TOOL_CHANGE,
        code: tokens[0].value,
      }
      image.children.push(node)
      break
    }

    case Grammar.GERBER_INTERPOLATE_MODE:
    case Grammar.DRILL_OPERATION:
    case Grammar.GERBER_OPERATION: {
      tokens
        .filter(t => t.type === Lexer.T_CODE)
        .forEach(
          t =>
            (tree = reducer(tree, {
              type: Grammar.DRILL_TOOL_CHANGE,
              tokens: [t],
            }))
        )

      tokens
        .filter(t => t.type === Lexer.G_CODE)
        .map(t => {
          if (t.value === '0') return Nodes.MOVE
          if (t.value === '1') return Nodes.LINE
          if (t.value === '2') return Nodes.CW_ARC
          if (t.value === '3') return Nodes.CCW_ARC
          return null
        })
        .forEach(mode => {
          image.children.push({type: Nodes.INTERPOLATE_MODE, mode})
        })

      const graphic = tokens
        .filter(t => t.type === Lexer.D_CODE)
        .reduce<Nodes.GraphicType>((_, t) => {
          if (t.value === '3') return Nodes.SHAPE
          if (t.value === '2') return Nodes.MOVE
          if (t.value === '1') return Nodes.SEGMENT
          return null
        }, null)

      if (
        tokens.some(t => t.type === Lexer.COORD_CHAR || t.type === Lexer.NUMBER)
      ) {
        image.children.push({
          type: Nodes.GRAPHIC,
          coordinates: tokensToCoordinates(tokens),
          graphic,
        })
      }
      break
    }

    case Grammar.GERBER_REGION_MODE: {
      const gCodeToken = tokens[0]
      image.children.push({
        type: Nodes.REGION_MODE,
        region: gCodeToken.value === '36',
      })
      break
    }

    case Grammar.GERBER_QUADRANT_MODE: {
      const gCodeToken = tokens[0]
      image.children.push({
        type: Nodes.QUADRANT_MODE,
        quadrant: gCodeToken.value === '74' ? Nodes.SINGLE : Nodes.MULTI,
      })
      break
    }

    case Grammar.DRILL_SLOT: {
      const slotToken = tokens.find(
        t => t.type === Lexer.G_CODE && t.value === '85'
      )
      const splitIdx = slotToken ? tokens.indexOf(slotToken) : -1

      if (splitIdx >= 0) {
        const {x: x1, y: y1} = tokensToCoordinates(tokens.slice(0, splitIdx))
        const {x: x2, y: y2} = tokensToCoordinates(tokens.slice(splitIdx))

        image.children.push({
          type: Nodes.GRAPHIC,
          graphic: Nodes.SLOT,
          coordinates: {x1, y1, x2, y2},
        })
      }

      break
    }

    case Grammar.DRILL_DONE:
    case Grammar.GERBER_DONE: {
      tree.done = true
      break
    }

    default: {
      const unhandledMatch: never = matchType
      throw new Error(`unhandled match: ${unhandledMatch}`)
    }
  }

  return tree
}

function tokensToCoordinates(tokens: Array<Lexer.Token>): Nodes.Coordinates {
  return tokens.reduce<Nodes.Coordinates>((coords, token, i) => {
    const prev = tokens[i - 1]

    if (token.type === Lexer.NUMBER && prev && prev.type === Lexer.COORD_CHAR) {
      coords[prev.value.toLowerCase()] = token.value
    }

    return coords
  }, {})
}
