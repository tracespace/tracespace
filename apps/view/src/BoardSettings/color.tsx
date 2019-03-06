import React from 'react'
import cx from 'classnames'
import contrast from 'contrast'
import {Field} from 'formik'

import {BoardOptions} from '../types'
import {ColorPill, Icon, Label} from '../ui'
import {FieldProps} from './types'
import {MASK_ALPHA} from './values'

type BoardColor = BoardOptions['color']

type ColorPreset = {
  title: string
  color: BoardColor
}

type ColorId = keyof BoardColor

const DEFAULT_COLOR_PRESET: BoardColor = {
  cf: '#cc9933',
  sm: '#004200',
  ss: '#ffffff',
}

const OSH_PARK_COLOR_PRESET: BoardColor = {
  cf: '#cc9933',
  sm: '#4b0082',
  ss: '#ffffff',
}

const SPARKFUN_COLOR_PRESET: BoardColor = {
  cf: '#f5f5f5',
  sm: '#cc0000',
  ss: '#ffffff',
}

const COLOR_PRESETS: Array<ColorPreset> = [
  {title: 'default', color: DEFAULT_COLOR_PRESET},
  {title: 'OSH Park', color: OSH_PARK_COLOR_PRESET},
  {title: 'SparkFun', color: SPARKFUN_COLOR_PRESET},
]

const COLOR_IDS: Array<ColorId> = ['sm', 'ss', 'cf']
const COLOR_NAMES = {sm: 'soldermask', ss: 'silkscreen', cf: 'copper finish'}

// TOCO(mc, 2019-03-01): move opacity entirely to pcb-stackup-core
const stripAlpha = (c: string): string => c.slice(0, 7)
const colorsMatch = (a: string, b: string): boolean =>
  stripAlpha(a) === stripAlpha(b)

function ColorInput(props: FieldProps & {colorId: ColorId}): JSX.Element {
  const {colorId, field, form} = props
  const value = stripAlpha(`${field.value}`)

  return (
    <Label className="h2">
      <span className="mr-auto">{COLOR_NAMES[colorId]}</span>
      <input
        {...field}
        value={value}
        type="color"
        className="clip"
        onChange={event => {
          let value = stripAlpha(event.target.value)
          if (colorId === 'sm') value += MASK_ALPHA
          form.setFieldValue(field.name, value)
        }}
      />
      <ColorPill color={value} />
    </Label>
  )
}

export function ColorPresetsField(props: {fieldName: string}): JSX.Element {
  return <Field name={props.fieldName} component={ColorPresetInput} />
}

export function ColorFields(props: {fieldName: string}): JSX.Element {
  return (
    <>
      {COLOR_IDS.map(id => (
        <Field
          key={id}
          name={`${props.fieldName}.${id}`}
          component={ColorInput}
          colorId={id}
        />
      ))}
    </>
  )
}

function ColorPresetInput(props: FieldProps): JSX.Element {
  return (
    <>
      {COLOR_PRESETS.map(preset => (
        <ColorPresetOption key={preset.title} {...preset} {...props} />
      ))}
    </>
  )
}

function ColorPresetOption(props: FieldProps & ColorPreset): JSX.Element {
  const {title, color, field, form} = props
  const value = {...color, sm: `${stripAlpha(color.sm)}${MASK_ALPHA}`}
  const checked = COLOR_IDS.every(i => colorsMatch(color[i], field.value[i]))
  const iconName = checked ? 'dot-circle' : 'circle'

  return (
    <Label className="h2">
      <input
        type="radio"
        className="clip"
        checked={checked}
        onChange={() => form.setFieldValue(field.name, value)}
      />
      <Icon name={iconName} className="flex-none nl2" />
      <span className="lh-title mr-auto">{title}</span>
      <BoardColorSwatch boardColor={color} />
    </Label>
  )
}

function BoardColorSwatch(props: {boardColor: BoardColor}): JSX.Element {
  const {boardColor} = props

  return (
    <div className="flex-none tf-skew-15">
      {COLOR_IDS.map((id, index, collection) => {
        const color = boardColor[id]
        const previous = boardColor[collection[index - 1]] || null
        const needsBorder = contrast(color) === 'light'
        const prevHasBorder = previous && contrast(previous) === 'light'
        const style = cx('border-box dib w1 h1 v-mid', {
          'bt bb br b--near-black': needsBorder,
          bl: needsBorder && !prevHasBorder,
        })

        return (
          <span key={id} className={style} style={{backgroundColor: color}} />
        )
      })}
    </div>
  )
}
