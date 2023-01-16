import {useState} from 'preact/hooks'

import {
  GerberContents,
  GerberParse,
  GerberPlot,
  GerberSvg,
} from '../components/gerber-render'

const gerberFixtures = import.meta.glob(
  '../../../packages/fixtures/gerbers/**/*.(gbr|drl)',
  {eager: true, as: 'raw'}
)

const SECTION_NAMES = [
  'pads',
  'strokes',
  'arc-strokes',
  'regions',
  'macro-primitives',
  'macros',
  'step-repeats',
  'drill',
]

const SECTIONS = SECTION_NAMES.map(sectionName => {
  const fixtures = Object.entries(gerberFixtures)
    .filter(([name]) =>
      name.startsWith(`../../../packages/fixtures/gerbers/${sectionName}`)
    )
    .map(([filename, contents]) => {
      const name = filename.split('/').slice(-1)[0]
      return {name, contents}
    })
    .sort((a, b) => a.name.length - b.name.length)

  return {sectionName, fixtures}
})

export function Page(): JSX.Element {
  return (
    <main class="p-4">
      <h1 class="text-2xl mb-4 p-1">tracespace render test</h1>
      {SECTIONS.map(({sectionName, fixtures}) => (
        <Section
          key={sectionName}
          sectionName={sectionName}
          fixtures={fixtures}
        />
      ))}
    </main>
  )
}

interface SectionProps {
  sectionName: string
  fixtures: Array<{name: string; contents: string}>
}

function Section(props: SectionProps): JSX.Element {
  const {sectionName, fixtures} = props

  return (
    <section class="mb-16">
      {fixtures.map(({name, contents}) => (
        <Fixture
          key={name}
          sectionName={sectionName}
          name={name}
          contents={contents}
        />
      ))}
    </section>
  )
}

interface FixtureProps {
  sectionName: string
  name: string
  contents: string
}

function Fixture(props: FixtureProps): JSX.Element {
  const {sectionName, name, contents} = props
  const [highlightedLines, setHighlightedLines] = useState<number[]>([])

  return (
    <div class="mb-8">
      <div class="sticky top-0 bg-white/95">
        <h2 class="text-lg p-1 font-mono">
          {sectionName}/{name}
        </h2>
        <div class="sticky top-0 flex grow-0 shrink-0 font-semibold">
          <p class="w-xs p-1 mr-3">Source</p>
          <p class="w-md p-1 mr-3">Parse</p>
          <p class="w-md p-1 mr-3">Plot</p>
          <p class="p-1">Render</p>
        </div>
      </div>
      <div class="flex shrink-0 text-xs whitespace-pre-wrap leading-normal max-h-xl overflow-hidden">
        <GerberContents
          class="w-xs mr-3 overflow-y-auto"
          contents={contents}
          highlightedLines={highlightedLines}
          setHighlightedLines={setHighlightedLines}
        />
        <GerberParse
          class="w-md mr-3 overflow-y-auto"
          contents={contents}
          highlightedLines={highlightedLines}
          setHighlightedLines={setHighlightedLines}
        />
        <GerberPlot class="w-md mr-3 overflow-y-auto" contents={contents} />
        <GerberSvg contents={contents} />
      </div>
    </div>
  )
}
