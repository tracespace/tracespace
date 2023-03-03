import type {StylableComponentProps} from './types'

export interface Props extends StylableComponentProps {
  value: number
  valueText: string
  min: number
  max: number
  onChange: (value: number) => unknown
}

export function LogSlider(props: Props): JSX.Element {
  const {value, valueText, min, max, onChange, ...styleProps} = props

  return (
    <input
      cursor="grab"
      type="range"
      value={Math.log(value)}
      aria-valuetext={valueText}
      step="any"
      min={Math.log(min)}
      max={Math.log(max)}
      appearance="none slider-thumb:none"
      text="white dark:dark-800"
      bg="dark-800 dark:white"
      border="rounded-full"
      onChange={event => {
        if (event.target instanceof HTMLInputElement) {
          onChange(Math.E ** Number(event.target.value))
        }
      }}
      {...styleProps}
    />
  )
}
