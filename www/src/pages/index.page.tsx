import {useState} from 'preact/hooks'

import {
  GerberContents,
  GerberParse,
  GerberPlot,
} from '../components/gerber-render'

const gerberFixtures = import.meta.glob(
  '../../../packages/fixtures/gerbers/**/*.(gbr|drl)',
  {as: 'raw'}
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
          <p class="w-1/5 p-1">Source</p>
          <p class="w-1/4 p-1">Parse</p>
          <p class="p-1">Plot</p>
        </div>
      </div>
      <div class="flex grow-0 shrink-0 text-xs whitespace-pre-wrap leading-normal">
        <GerberContents
          class="w-1/5"
          contents={contents}
          highlightedLines={highlightedLines}
          setHighlightedLines={setHighlightedLines}
        />
        <GerberParse
          class="w-1/4"
          contents={contents}
          highlightedLines={highlightedLines}
          setHighlightedLines={setHighlightedLines}
        />
        <GerberPlot contents={contents} />
      </div>
    </div>
  )
}
