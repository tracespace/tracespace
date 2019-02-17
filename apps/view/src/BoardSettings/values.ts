import {
  Optional,
  BoardRender,
  BoardUpdate,
  BoardOptions,
  LayerOptions,
  LayerUpdatesMap,
  Logger,
} from '../types'

import {
  Values,
  FormBoardOptions,
  FormLayerOptions,
  FormLayerUpdatesMap,
} from './types'

export const MASK_ALPHA = 'bf'
export const GAP_FILL_DEFAULT = 0.00011

export function valuesToBoardUpdate(values: Values, log: Logger): BoardUpdate {
  let outlineGapFill =
    values.options.outlineGapFill !== ''
      ? Number(values.options.outlineGapFill)
      : GAP_FILL_DEFAULT

  if (!Number.isFinite(outlineGapFill)) outlineGapFill = GAP_FILL_DEFAULT

  return {
    name: values.name,
    options: parseFormBoardOptions(values.options),
    gerberOptions: parseFormLayerOptions(values.gerberOptions, log),
    drillOptions: parseFormLayerOptions(values.drillOptions, log),
    layers: parseFormLayerUpdates(values.layers),
  }
}

export function boardRenderToValues(board: BoardRender): Values {
  return {
    name: board.name,
    options: boardOptionsToFormValue(board.options),
    gerberOptions: layerOptionsToFormValue(board.gerberOptions),
    drillOptions: layerOptionsToFormValue(board.drillOptions),
    layers: board.layers.reduce<FormLayerUpdatesMap>(
      (result, ly) => ({
        ...result,
        [ly.id]: {side: ly.side || '', type: ly.type || '', color: ly.color},
      }),
      {}
    ),
  }
}

function parseFormBoardOptions(formOptions: FormBoardOptions): BoardOptions {
  let color = formOptions.color
  let outlineGapFill =
    formOptions.outlineGapFill !== ''
      ? Number(formOptions.outlineGapFill)
      : GAP_FILL_DEFAULT

  if (!Number.isFinite(outlineGapFill)) outlineGapFill = GAP_FILL_DEFAULT

  color = {...color, sm: `${color.sm.slice(0, 7)}${MASK_ALPHA}`}

  return {...formOptions, color, outlineGapFill}
}

function parseFormLayerOptions(
  formOptions: FormLayerOptions,
  log: Logger
): Optional<LayerOptions> {
  const {coordinateFormat, zeroSuppression, units} = formOptions
  const result: Optional<LayerOptions> = {}

  if (Array.isArray(coordinateFormat)) {
    const parsed = coordinateFormat.map(Number)
    if (Number.isInteger(parsed[0]) && Number.isInteger(parsed[1])) {
      result.coordinateFormat = [parsed[0], parsed[1]]
    } else {
      log.warn('Invalid coordinateFormat:', coordinateFormat)
    }
  }

  if (zeroSuppression) result.zeroSuppression = zeroSuppression
  if (units) result.units = units

  return result
}

function parseFormLayerUpdates(
  formUpdates: FormLayerUpdatesMap
): LayerUpdatesMap {
  return Object.keys(formUpdates).reduce<LayerUpdatesMap>((result, id) => {
    const update = formUpdates[id]

    return {
      ...result,
      [id]: {
        type: update.type || null,
        side: update.side || null,
        color: update.color,
      },
    }
  }, {})
}

function boardOptionsToFormValue(options: BoardOptions): FormBoardOptions {
  return {
    ...options,
    color: {
      ...options.color,
      sm: options.color.sm.slice(0, 7),
    },
  }
}

function layerOptionsToFormValue(
  options: Optional<LayerOptions>
): FormLayerOptions {
  return {
    coordinateFormat: options.coordinateFormat || '',
    zeroSuppression: options.zeroSuppression || '',
    units: options.units || '',
  }
}
