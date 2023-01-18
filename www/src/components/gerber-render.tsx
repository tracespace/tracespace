import type {Ref} from 'preact'
import {useMemo, useRef, useEffect} from 'preact/hooks'
import stringifyObject from 'json-stringify-pretty-compact'

import {stringifySvg} from '@tracespace/core'
import type {GerberTree, GerberNode} from '@tracespace/parser'
import {createParser} from '@tracespace/parser'
import type {ImageTree, ImageNode} from '@tracespace/plotter'
import {plot} from '@tracespace/plotter'
import {render} from '@tracespace/renderer'

import type {SvgElement} from '@tracespace/renderer'

export interface GerberFixture {
  contents: string
  parseTree: GerberTree
}

const useGerberTree = (contents: string): GerberTree => {
  return useMemo(() => createParser().feed(contents).result(), [contents])
}

const useImageTree = (gerberTree: GerberTree): ImageTree => {
  return useMemo(() => plot(gerberTree), [gerberTree])
}

const useRenderTree = (imageTree: ImageTree): SvgElement => {
  return useMemo(() => render(imageTree), [imageTree])
}

const useRenderHtml = (renderTree: SvgElement): string => {
  return useMemo(() => stringifySvg(renderTree), [renderTree])
}

const useHighlight = <E extends HTMLElement>(highlight?: boolean): Ref<E> => {
  const element = useRef<E>(null)

  useEffect(() => {
    if (highlight === true) {
      element.current?.scrollIntoView({block: 'nearest', behavior: 'smooth'})
    }
  }, [highlight])

  return element
}

export interface GerberRenderProps {
  contents: string
  highlightedLines: number[]
  setHighlightedLines: (lines: number[]) => unknown
  class?: string
}

export function GerberContents(props: GerberRenderProps): JSX.Element {
  const {
    contents,
    highlightedLines,
    setHighlightedLines,
    class: className,
  } = props

  return (
    <code class={className}>
      {contents
        .trim()
        .split('\n')
        .map((text, index) => (
          <GerberLine
            key={index}
            text={text}
            line={index + 1}
            highlightedLines={highlightedLines}
            setHighlightedLines={setHighlightedLines}
          />
        ))}
    </code>
  )
}

export function GerberParse(props: GerberRenderProps): JSX.Element {
  const {
    contents,
    highlightedLines,
    setHighlightedLines,
    class: className,
  } = props
  const gerberTree = useGerberTree(contents)

  return (
    <code class={className}>
      {gerberTree.children.map((node, index) => (
        <GerberNodeItem
          key={index}
          node={node}
          highlightedLines={highlightedLines}
          setHighlightedLines={setHighlightedLines}
        />
      ))}
    </code>
  )
}

export function GerberPlot(
  props: Pick<GerberRenderProps, 'contents' | 'class'>
): JSX.Element {
  const {contents, class: className} = props
  const gerberTree = useGerberTree(contents)
  const imageTree = useImageTree(gerberTree)

  return (
    <code class={className}>
      {imageTree.children.map((node, index) => (
        <TreeNode key={index} node={node} class="p-1" />
      ))}
    </code>
  )
}

export function GerberSvg(
  props: Pick<GerberRenderProps, 'contents' | 'class'>
): JSX.Element {
  const {contents, class: className} = props
  const gerberTree = useGerberTree(contents)
  const imageTree = useImageTree(gerberTree)
  const renderTree = useRenderTree(imageTree)
  const renderHtml = useRenderHtml(renderTree)

  return (
    <code
      class={className}
      dangerouslySetInnerHTML={{__html: renderHtml}}
    ></code>
  )
}

interface GerberLineProps {
  text: string

  line: number
  highlightedLines: number[]
  setHighlightedLines: (lines: number[]) => unknown
}

function GerberLine(props: GerberLineProps): JSX.Element {
  const {text, line, highlightedLines, setHighlightedLines} = props
  const onMouseEnter = (): unknown => setHighlightedLines([line])
  const onMouseLeave = (): unknown => setHighlightedLines([])
  const highlight =
    line >= Math.min(...highlightedLines) &&
    line <= Math.max(...highlightedLines)

  const element = useHighlight<HTMLParagraphElement>(highlight)

  return (
    <p
      class={`p-1 ${highlight ? 'bg-red-100' : ''}`}
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
      ref={element}
    >
      <span class="pr-2">{line}</span>
      {text}
    </p>
  )
}

interface GerberNodeProps {
  node: GerberNode
  highlightedLines: number[]
  setHighlightedLines: (lines: number[]) => unknown
}

function GerberNodeItem(props: GerberNodeProps): JSX.Element {
  const {node, highlightedLines, setHighlightedLines} = props
  const startLine = node.position?.start.line
  const endLine = node.position?.end.line
  const lines = [startLine, endLine].filter((n): n is number => n !== undefined)
  const onMouseEnter = (): unknown => setHighlightedLines(lines)
  const onMouseLeave = (): unknown => setHighlightedLines([])
  const highlight = highlightedLines.some(
    highlightedLine =>
      startLine !== undefined &&
      endLine !== undefined &&
      startLine <= highlightedLine &&
      endLine >= highlightedLine
  )

  return (
    <TreeNode
      class="p-1"
      node={node}
      highlight={highlight}
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
    />
  )
}

type AnyNode = ImageNode | GerberNode
type AnyNodeValue = ImageNode[keyof ImageNode] | GerberNode[keyof GerberNode]

interface TreeNodeProps {
  node: AnyNode
  class?: string
  highlight?: boolean
  onMouseEnter?: (event: MouseEvent) => unknown
  onMouseLeave?: (event: MouseEvent) => unknown
}

const isTreeNode = (value: unknown): value is AnyNode => {
  return typeof value === 'object' && value !== null && 'type' in value
}

const isListOfTreeNodes = (value: unknown): value is AnyNode[] => {
  return Array.isArray(value) && value.length > 0 && value.every(isTreeNode)
}

const isTreeNodeOrList = (value: unknown): boolean => {
  return isTreeNode(value) || isListOfTreeNodes(value)
}

function TreeNode(props: TreeNodeProps): JSX.Element {
  const {node, highlight, onMouseEnter, onMouseLeave, class: className} = props
  const {type} = node
  const payload: Array<[key: string, value: AnyNodeValue]> = Object.entries(
    node
  )
    .filter(([key]) => key !== 'type' && key !== 'position')
    .sort((a, b) => {
      if (isTreeNodeOrList(a[1]) && !isTreeNodeOrList(b[1])) return 1
      if (!isTreeNodeOrList(a[1]) && isTreeNodeOrList(b[1])) return -1
      return 0
    })

  const element = useHighlight<HTMLDivElement>(highlight)

  return (
    <div
      class={`${className ?? ''} ${highlight === true ? 'bg-red-100' : ''}`}
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
      ref={element}
    >
      <p class="font-semibold">type: {type}</p>
      <ul>
        {payload.map(([key, value], index) => (
          <li key={index}>
            {isTreeNode(value) ? (
              <div>
                <p>{key}:</p>
                <TreeNode node={value} class="mt-1 pl-4" />
              </div>
            ) : isListOfTreeNodes(value) ? (
              <div class="mb-1">
                <p>{key}:</p>
                <ul class="pl-4">
                  {value.map((childNode, index) => (
                    <li key={index}>
                      <TreeNode node={childNode} class="mt-1" />
                    </li>
                  ))}
                </ul>
              </div>
            ) : (
              `${key}: ${stringifyObject(value, {
                indent: '  ',
                maxLength: 50 - key.length,
              })}`
            )}
          </li>
        ))}
      </ul>
    </div>
  )
}
