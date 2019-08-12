// ensure that one child of given type exists in a parent node
// modifies and returns tree
import * as Lexer from '../lexer'
import * as Grammar from '../grammar'
import * as Nodes from './nodes'

export function reducer(
  tree: Nodes.Root,
  matchType: Grammar.GrammarMatch['type'],
  tokens: Array<Lexer.Token>
): Nodes.Root {
  const [header, image] = tree.children

  switch (matchType) {
    case Grammar.DRILL_COMMENT: {
      const value = tokens
        .slice(1, -1)
        .map(t => t.value)
        .join('')
        .trim()

      const target = image.children.length ? image : header
      appendDeepestChild(target, {type: Nodes.COMMENT, value})
      break
    }

    case Grammar.GERBER_UNITS: {
      const units = tokens[1].value === 'MM' ? 'mm' : 'in'
      ensureChild(header, {type: Nodes.UNITS, units})
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
        ensureChild(header, {
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
        } else if (token.type === Lexer.DRILL_COORD_FORMAT) {
          const [integer, decimal] = token.value.split('.')
          format = [integer.length, decimal.length]
        }
      })

      if (units) ensureChild(header, {type: Nodes.UNITS, units})

      if (format || zeroSuppression) {
        ensureChild(header, {
          type: Nodes.COORDINATE_FORMAT,
          mode: null,
          format,
          zeroSuppression,
        })
      }
      break
    }

    case Grammar.GERBER_TOOL_DEFINITION: {
      const code = tokens[1].value
      const name = tokens[2].value
      const params: Array<number> = tokens
        .slice(3)
        .filter(t => t.type === Lexer.NUMBER)
        .map(t => Number(t.value))

      let shape: Nodes.ToolShape | null = null
      let hole: Nodes.HoleShape | null = null
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
      }

      if (holeParams.length === 1) {
        const [diameter] = holeParams
        hole = {type: 'circle', diameter}
      } else if (holeParams.length === 2) {
        const [xSize, ySize] = holeParams
        hole = {type: 'rectangle', xSize, ySize}
      }

      if (shape) {
        appendChild(header, {type: Nodes.TOOL_DEFINITION, code, shape, hole})
      }
      break
    }

    case Grammar.DRILL_TOOL_DEFINITION: {
      const code = tokens[0].value
      const hole = null
      const shape = {
        type: Nodes.CIRCLE,
        diameter: Number(tokens[1].value.slice(1)),
      }

      appendChild(header, {type: Nodes.TOOL_DEFINITION, hole, code, shape})
      break
    }

    case Grammar.GERBER_TOOL_CHANGE: {
      const codeToken = tokens.find(t => t.type === Lexer.D_CODE)
      if (codeToken) {
        const node = {type: Nodes.TOOL, children: [], code: codeToken.value}
        appendDeepestChild(image, node, Nodes.IMAGE)
      }
      break
    }

    case Grammar.DRILL_TOOL_CHANGE: {
      const node = {type: Nodes.TOOL, children: [], code: tokens[0].value}
      appendDeepestChild(image, node, Nodes.IMAGE)
      break
    }

    case Grammar.GERBER_OPERATION: {
      const operation = tokens.find(t => t.type === Lexer.D_CODE)
      const coordinates = tokensToCoordinates(tokens)
      let graphic = null
      if (operation) {
        if (operation.value === '3') {
          graphic = Nodes.SHAPE
        } else if (operation.value === '2') {
          graphic = Nodes.MOVE
        } else if (operation.value === '1') {
          graphic = Nodes.SEGMENT
        }
      }

      appendDeepestChild(image, {type: Nodes.GRAPHIC, coordinates, graphic})
      break
    }

    case Grammar.DRILL_OPERATION: {
      tokens
        .filter(t => t.type === Lexer.T_CODE)
        .forEach(t => (tree = reducer(tree, Grammar.DRILL_TOOL_CHANGE, [t])))

      appendDeepestChild(image, {
        type: Nodes.GRAPHIC,
        graphic: Nodes.SHAPE,
        coordinates: tokensToCoordinates(tokens),
      })
      break
    }

    case Grammar.DRILL_DONE:
    case Grammar.GERBER_DONE: {
      tree.done = true
      break
    }

    default: {
      console.warn('unhandled match', matchType, tokens)
    }
  }

  return tree
}

export function ensureChild(parent: Nodes.Parent, child: Nodes.Node): unknown {
  let i

  for (i = 0; i < parent.children.length; i++) {
    const current = parent.children[i]
    if (current.type === child.type) {
      return (parent.children[i] = child)
    }
  }

  parent.children.push(child)
}

export function appendChild(parent: Nodes.Parent, child: Nodes.Node): void {
  parent.children.push(child)
}

export function appendDeepestChild(
  parent: Nodes.Parent,
  child: Nodes.Node,
  type?: Nodes.NodeType
): unknown {
  let i

  for (i = parent.children.length - 1; i >= 0; i--) {
    const candidate = parent.children[i]

    if (candidate.children && (!type || candidate.type === type)) {
      return appendDeepestChild(candidate as Nodes.Parent, child, type)
    }
  }

  if (!type || parent.type === type) {
    appendChild(parent, child)
  }
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
