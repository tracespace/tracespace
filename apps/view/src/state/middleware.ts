// all store middleware
import {createAnalyticsMiddleware} from '../analytics'
import {createLogMiddleware} from '../logger'
import {createRenderMiddleware} from '../render'
import {createSettingsMiddleware} from '../settings'
import {Middleware} from './types'

export default function createMiddleware(): Array<Middleware> {
  return [
    createAnalyticsMiddleware(),
    createRenderMiddleware(),
    createSettingsMiddleware(),
    createLogMiddleware(),
  ]
}
