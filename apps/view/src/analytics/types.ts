import {Optional} from '../types'

export type FileUploadType = 'zip' | 'files' | 'mixed'

export type CreateBoardAnalyticsPayload = {
  source: 'url' | 'filePicker' | 'dragAndDrop'
  uploadType?: FileUploadType
}

export type BoardRenderAnalyticsPayload = Optional<{
  useOutline: boolean
  outlineGapFill: number
  colorSoldermask: string
  colorSilkscreen: string
  colorCopperFinish: string
  gerberCoordinateFormat: string
  gerberZeroSuppression: string
  gerberUnits: string
  drillCoordinateFormat: string
  drillZeroSuppression: string
  drillUnits: string
  sourceUrlHash: string
  sourceFilesHash: string
  renderTime: number
}>

export type ErrorAnalyticsPayload = {
  trigger: string
  message: string
}

export type AppOpenedAnalyticsPayload = {
  savedBoards: number
}

export type AnalyticsEvent =
  | ['appOpened', AppOpenedAnalyticsPayload]
  | ['createBoardRequest', CreateBoardAnalyticsPayload]
  | ['getBoardRequest', Record<string, never>]
  | ['boardRendered', BoardRenderAnalyticsPayload]
  | ['boardUpdated', BoardRenderAnalyticsPayload]
  | ['boardDeleted', BoardRenderAnalyticsPayload]
  | ['boardDownloaded', BoardRenderAnalyticsPayload]
  | ['error', ErrorAnalyticsPayload]
