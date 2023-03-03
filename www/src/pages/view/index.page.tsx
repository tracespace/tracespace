import {faPlus} from '@fortawesome/free-solid-svg-icons/faPlus'

import {Icon} from '../../components/icon'
import {FileInput} from '../../components/file-input'
import {DarkModeToggle} from '../../dark-mode'

import {useAddFiles, useRenderResult} from './store'

import {RenderViewer} from './render-viewer'

export function Page(): JSX.Element {
  const renderResult = useRenderResult()
  const addFiles = useAddFiles()

  return (
    <main min-width="screen" min-h="screen">
      <nav
        pos="sticky"
        z="2"
        transition="~"
        bg="white/0 hover:white/90 dark:hover:dark-800/90"
      >
        <div flex="~" m="x-auto" p="x-8" max-w="256">
          <h1 m="y-4" text="lg">
            <span>tracespace </span>
            <span font="bold">view</span>
          </h1>
          <DarkModeToggle m="l-auto" />
        </div>
      </nav>
      {renderResult === undefined ? (
        <FileInput
          flex="~ col"
          align="items-center"
          max-w="screen-lg"
          m="t-32 lg:t-64 x-auto"
          p="x-16"
          text="base center"
          onChange={event => {
            const inputFiles = event.currentTarget.files

            if (inputFiles !== null && inputFiles.length > 0) {
              const files = [...inputFiles]
              addFiles(files)
            }
          }}
        >
          <Icon data={faPlus} w="2em" h="2em" m="b-4" />
          Select your Gerber and drill files to render your PCB
        </FileInput>
      ) : (
        <RenderViewer render={renderResult} />
      )}
    </main>
  )
}
