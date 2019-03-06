// database types
import Dexie from 'dexie'
import {Board, Layer, Omit} from '../types'

export type DbBoard = Omit<Board, 'layers'>

export type DbLayer = Omit<Layer, 'source'>

export type DbSource = {id: string; contents: Buffer}

export type DbLayersMap = {[id: string]: DbLayer}

export class BoardDatabase extends Dexie {
  boards: Dexie.Table<DbBoard, string>
  layers: Dexie.Table<DbLayer, string>
  sources: Dexie.Table<DbSource, string>
}
