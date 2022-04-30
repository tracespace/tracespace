import {ComponentChildren} from 'preact'
import {useEffect, useRef, useState} from 'preact/hooks'
import stringifyJson from 'json-stringify-pretty-compact'

import {Root as GerberTree, ChildNode, createParser} from '@tracespace/parser'

export interface GerberFixture {
  contents: string
  parseTree: GerberTree
}

const useGerberTree = (contents: string): GerberTree => {
  const result = useRef<GerberTree | null>(null)

  useEffect(() => {
    result.current = null
  }, [contents])

  if (result.current === null) {
    const parser = createParser()
    parser.feed(contents)
    result.current = parser.results()
  }

  return result.current
}

export interface GerberRenderProps {
  contents: string
  children?: ComponentChildren
}

export function GerberRender(props: GerberRenderProps): JSX.Element | null {
  const {contents, children} = props
  const gerberTree = useGerberTree(contents)

  const [highlightedLine, setHighlightedLine] = useState<number | null>(null)

  return (
    <div class="flex content-start mb-4">
      <code class="mx-2 w-xs">
        {contents
          .trim()
          .split('\n')
          .map((line, index) => (
            <GerberLine
              key={index}
              line={line}
              lineNumber={index + 1}
              highlightedLineNumber={highlightedLine}
              onHover={setHighlightedLine}
            />
          ))}
      </code>
      <code class="mx-2 w-xl">
        {gerberTree.children.map((node, index) => (
          <GerberNode
            key={index}
            node={node}
            highlightedLineNumber={highlightedLine}
            onHover={setHighlightedLine}
          />
        ))}
      </code>
      {children}
    </div>
  )
}

interface GerberLineProps {
  line: string

  lineNumber: number
  highlightedLineNumber: number | null
  onHover: (lineNumber: number | null) => unknown
}

function GerberLine(props: GerberLineProps): JSX.Element {
  const {line, lineNumber, highlightedLineNumber, onHover} = props
  const handleMouseEnter = () => onHover(lineNumber)
  const handleMouseLeave = () => onHover(null)

  return (
    <p
      class={`p-1 ${highlightedLineNumber === lineNumber ? 'bg-red-100' : ''}`}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      <span class="pr-2">{lineNumber}</span>
      {line}
    </p>
  )
}

interface GerberNodeProps {
  node: ChildNode
  highlightedLineNumber: number | null
  onHover: (lineNumber: number | null) => unknown
}

function GerberNode(props: GerberNodeProps): JSX.Element {
  const {node, highlightedLineNumber, onHover} = props
  const lineNumber = node.position?.start.line ?? null
  const handleMouseEnter = () => onHover(lineNumber)
  const handleMouseLeave = () => onHover(null)

  const payload = Object.entries(props.node).filter(
    ([key]) => key !== 'type' && key !== 'position'
  )

  return (
    <div
      class={`p-1 ${highlightedLineNumber === lineNumber ? 'bg-red-100' : ''}`}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      <p>type: {props.node.type}</p>
      <ul>
        {payload.map(([key, value]) => (
          <li>
            {key}: {stringifyJson(value)}
          </li>
        ))}
      </ul>
    </div>
  )
}
