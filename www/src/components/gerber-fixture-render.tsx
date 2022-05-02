import {GerberRender} from './gerber-render'

const gerberFixtures = import.meta.glob(
  '../../../packages/fixtures/gerbers/**/*',
  {as: 'raw'}
)

export interface GerberFixtureRenderProps {
  source: string
}

export function GerberFixtureRender(
  props: GerberFixtureRenderProps
): JSX.Element {
  const {source} = props
  const fullSourcePath = `../../../packages/fixtures/${source}`
  const expectedRenderPath = fullSourcePath.replace(/\.gbr$/, '.svg')

  const contents = gerberFixtures[fullSourcePath]
  const expectedRender = gerberFixtures[expectedRenderPath]

  return (
    <GerberRender contents={contents}>
      <object
        data={`data:image/svg+xml;utf8,${expectedRender}`}
        type="image/svg+xml"
        class="self-start"
      />
    </GerberRender>
  )
}
