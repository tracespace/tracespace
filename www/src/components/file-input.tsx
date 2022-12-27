import type {ComponentChildren} from 'preact'
import type {StylableComponentProps} from './types'

export interface FileInputProps extends StylableComponentProps {
  children: ComponentChildren
  onChange: JSX.DOMAttributes<HTMLInputElement>['onChange']
}

export function FileInput(props: FileInputProps): JSX.Element {
  const {children, onChange, ...styleAttributes} = props

  return (
    <label cursor="pointer" {...styleAttributes}>
      {children}
      <input onChange={onChange} sr="only" type="file" multiple />
    </label>
  )
}
