import MD5 from 'md5.js'
import * as State from '../state'
import {isZip} from '../util'
import {getDefaultLayerOptions} from '../layers'
import {BoardRender} from '../types'
import {
  AnalyticsEvent,
  FileUploadType,
  BoardRenderAnalyticsPayload,
} from './types'

export const APP_OPENED = 'appOpened'
export const CREATE_BOARD_REQUEST = 'createBoardRequest'
export const GET_BOARD_REQUEST = 'getBoardRequest'
export const BOARD_RENDERED = 'boardRendered'
export const BOARD_UPDATED = 'boardUpdated'
export const BOARD_DELETED = 'boardDeleted'
export const BOARD_DOWNLOADED = 'boardDownloaded'
export const ERROR = 'error'

export default function createEvent(
  action: State.Action,
  nextState: State.State,
  prevState: State.State
): AnalyticsEvent | null {
  switch (action.type) {
    case State.CREATE_BOARD: {
      const source = action.metadata.dragAndDrop ? 'dragAndDrop' : 'filePicker'
      let uploadType: FileUploadType = 'files'

      if (action.payload.every(isZip)) {
        uploadType = 'zip'
      } else if (action.payload.some(isZip)) {
        uploadType = 'mixed'
      }

      return [CREATE_BOARD_REQUEST, {source, uploadType}]
    }

    case State.CREATE_BOARD_FROM_URL: {
      return [CREATE_BOARD_REQUEST, {source: 'url'}]
    }

    case State.GET_BOARD: {
      return [GET_BOARD_REQUEST, {}]
    }

    case State.BOARD_RENDERED: {
      const payload = {
        ...getRenderPayload(action.payload),
        renderTime: action.metadata.time,
      }

      return [BOARD_RENDERED, payload]
    }

    case State.BOARD_UPDATED: {
      const payload =
        nextState.board && action.payload.id === nextState.board.id
          ? getRenderPayload(nextState.board)
          : {}

      return [BOARD_UPDATED, payload]
    }

    case State.BOARD_DELETED: {
      const payload =
        prevState.board && action.payload === prevState.board.id
          ? getRenderPayload(prevState.board)
          : {}

      return [BOARD_DELETED, payload]
    }

    case State.BOARD_PACKAGED: {
      const payload =
        nextState.board && action.payload.id === nextState.board.id
          ? getRenderPayload(nextState.board)
          : {}

      return [BOARD_DOWNLOADED, payload]
    }

    case State.WORKER_INITIALIZED: {
      return [APP_OPENED, {savedBoards: action.payload.length}]
    }

    case State.WORKER_ERRORED: {
      const trigger = action.payload.request.type
      const message = action.payload.error.message

      return [ERROR, {trigger, message}]
    }
  }

  return null
}

function getRenderPayload(board: BoardRender): BoardRenderAnalyticsPayload {
  const {options, gerberOptions, drillOptions} = board
  const defaultGerberOptions = getDefaultLayerOptions(board.layers, 'gerber')
  const defaultDrillOptions = getDefaultLayerOptions(board.layers, 'drill')

  const gerberUnits = gerberOptions.units || defaultGerberOptions.units
  const gerberZeroSuppression =
    gerberOptions.zeroSuppression || defaultGerberOptions.zeroSuppression
  const gerberCoordFormat =
    gerberOptions.coordinateFormat || defaultGerberOptions.coordinateFormat

  const drillUnits = drillOptions.units || defaultDrillOptions.units
  const drillZeroSuppression =
    drillOptions.zeroSuppression || defaultDrillOptions.zeroSuppression
  const drillCoordFormat =
    drillOptions.coordinateFormat || defaultDrillOptions.coordinateFormat

  const payload: BoardRenderAnalyticsPayload = {
    useOutline: options.useOutline,
    outlineGapFill: options.outlineGapFill,
    colorSoldermask: options.color.sm,
    colorSilkscreen: options.color.ss,
    colorCopperFinish: options.color.cf,

    gerberUnits,
    gerberZeroSuppression,
    gerberCoordinateFormat: gerberCoordFormat && gerberCoordFormat.join(','),

    drillUnits,
    drillZeroSuppression,
    drillCoordinateFormat: drillCoordFormat && drillCoordFormat.join(','),

    sourceUrlHash: board.sourceUrl
      ? new MD5().update(board.sourceUrl).digest('hex')
      : null,
    sourceFilesHash: board.sourceIds
      .reduce<MD5>((hasher, id) => hasher.update(id), new MD5())
      .digest('hex'),
  }

  return payload
}
