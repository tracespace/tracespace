import {ComponentChildren} from 'preact'
import {useState, useMemo} from 'preact/hooks'
import stringifyJson from 'json-stringify-pretty-compact'

import {GerberTree, GerberNode, createParser} from '@tracespace/parser'

import {ImageTree, ImageNode, plot} from '@tracespace/plotter'

export interface GerberFixture {
  contents: string
  parseTree: GerberTree
}

const useGerberTree = (contents: string): GerberTree => {
  return useMemo(() => {
    const parser = createParser()
    parser.feed(contents)
    return parser.results()
  }, [contents])
}

const useImageTree = (gerberTree: GerberTree): ImageTree => {
  return useMemo(() => plot(gerberTree), [gerberTree])
}

export interface GerberRenderProps {
  contents: string
  children?: ComponentChildren
}

export function GerberRender(props: GerberRenderProps): JSX.Element | null {
  const {contents, children} = props
  const gerberTree = useGerberTree(contents)
  const imageTree = useImageTree(gerberTree)

  const [highlightedLine, setHighlightedLine] = useState<number | null>(null)

  return (
    <div class="flex content-start mb-4 text-sm">
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
          <GerberNodeItem
            key={index}
            node={node}
            highlightedLineNumber={highlightedLine}
            onHover={setHighlightedLine}
          />
        ))}
      </code>
      <code class="mx-2 w-xl whitespace-pre">
        {imageTree.children[0].children.map((node, index) => (
          <ImageNodeItem key={index} node={node} />
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
  node: GerberNode
  highlightedLineNumber: number | null
  onHover: (lineNumber: number | null) => unknown
}

function GerberNodeItem(props: GerberNodeProps): JSX.Element {
  const {node, highlightedLineNumber, onHover} = props
  const lineNumber = node.position?.start.line ?? null
  const handleMouseEnter = () => onHover(lineNumber)
  const handleMouseLeave = () => onHover(null)

  const payload = Object.entries(node).filter(
    ([key]) => key !== 'type' && key !== 'position'
  )

  return (
    <div
      class={`p-1 ${highlightedLineNumber === lineNumber ? 'bg-red-100' : ''}`}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      <p>type: {node.type}</p>
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

interface ImageNodeProps {
  node: ImageNode
}

function ImageNodeItem(props: ImageNodeProps): JSX.Element {
  const {node} = props
  const payload = Object.entries(node).filter(([key]) => key !== 'type')

  return (
    <div class="p-1">
      <p>type: {node.type}</p>
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
