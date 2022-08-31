import {useState} from 'preact/hooks'
import {faPlus} from '@fortawesome/free-solid-svg-icons/faPlus'

import {Icon} from '../components/icon'
import {FileInput} from '../components/file-input'
import {DarkModeToggle} from '../dark-mode'

export function Page(): JSX.Element {
  const [files, setFiles] = useState<File[] | undefined>(undefined)

  return (
    <main>
      <div flex="~" m="x-auto" p="x-8" max-w="256">
        <h1 m="y-4" text="lg">
          <span>tracespace </span>
          <span font="bold">view</span>
        </h1>
        <DarkModeToggle m="l-auto" />
      </div>
      {files === undefined ? (
        <FileInput
          flex="~ col"
          align="items-center"
          max-w="screen-lg"
          m="t-32 lg:t-48 x-auto"
          p="x-16"
          text="base center"
          onChange={event => {
            const inputFiles = event.currentTarget.files

            if (inputFiles !== null && inputFiles.length > 0) {
              setFiles([...inputFiles])
            }
          }}
        >
          <Icon data={faPlus} w="2em" h="2em" m="b-4" />
          Select your Gerber and drill files to render your PCB
        </FileInput>
      ) : (
        <ul>
          {files.map(file => (
            <li>{file.name}</li>
          ))}
        </ul>
      )}
    </main>
  )
}
