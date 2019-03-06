import {FormikProps, FieldProps as FormikFieldProps} from 'formik'

import {
  BoardRender,
  BoardOptions,
  LayerOptions,
  GerberSide,
  GerberType,
} from '../types'

export type Values = {
  name: BoardRender['name']
  options: FormBoardOptions
  gerberOptions: FormLayerOptions
  drillOptions: FormLayerOptions
  layers: FormLayerUpdatesMap
}

export type FormProps = FormikProps<Values>

export type FieldProps = FormikFieldProps<Values>

export type FormBoardOptions = {
  useOutline: BoardOptions['useOutline']
  color: BoardOptions['color']
  outlineGapFill: BoardOptions['outlineGapFill'] | string
}

export type FormLayerOptions = {
  coordinateFormat: [number | string, number | string] | ''
  zeroSuppression: LayerOptions['zeroSuppression'] | ''
  units: LayerOptions['units'] | ''
}

export type FormLayerUpdatesMap = {
  [id: string]: FormLayerUpdates
}

export type FormLayerUpdates = {
  side: NonNullable<GerberSide> | ''
  type: NonNullable<GerberType> | ''
  color: string
}
