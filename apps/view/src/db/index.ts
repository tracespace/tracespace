// indexedDB storage of layers and boards
import {Board, BoardSummary} from '../types'
import {NotFoundError} from './errors'
import {BoardDatabase, DbBoard} from './types'
export * from './types'

export async function createDatabase(): Promise<BoardDatabase> {
  return import('dexie').then(({default: Dexie}) => {
    const db = new Dexie('BoardDatabase')

    db.version(1).stores({
      boards: 'id, &sourceUrl',
      layers: 'id, sourceId',
      sources: 'id',
    })

    return db as BoardDatabase
  })
}

export async function saveBoard(
  db: BoardDatabase,
  board: Board
): Promise<string> {
  return db.transaction('rw', db.boards, db.layers, db.sources, async () => {
    const {layers, ...dbBoard} = board

    const dbLayers = dbBoard.layerIds.map(lyId => {
      const {source: _source, ...dbLayer} = layers[lyId]
      return dbLayer
    })

    const dbSources = dbBoard.layerIds.map(lyId => {
      const {sourceId: id, source: contents} = layers[lyId]
      return {id, contents}
    })

    db.sources.bulkPut(dbSources)
    db.layers.bulkPut(dbLayers)
    return db.boards.put(dbBoard)
  })
}

export async function getBoard(db: BoardDatabase, id: string): Promise<Board> {
  return db.transaction('r', db.boards, db.layers, db.sources, async () =>
    db.boards.get(id).then(board => {
      if (!board) throw new NotFoundError(`board ${id} not found`)
      return getFullBoard(db, board)
    })
  )
}

export async function getBoards(
  db: BoardDatabase
): Promise<Array<BoardSummary>> {
  return db.boards.toArray().then(boards =>
    boards.map(b => {
      const {id, name, options, thumbnail} = b
      return {id, name, options, thumbnail}
    })
  )
}

export async function findBoardByUrl(
  db: BoardDatabase,
  url: string
): Promise<Board | null> {
  return db.transaction('r', db.boards, db.layers, db.sources, async () =>
    db.boards
      .get({sourceUrl: url})
      .then(board => (board ? getFullBoard(db, board) : Promise.resolve(null)))
  )
}

export async function deleteBoard(
  db: BoardDatabase,
  id: string
): Promise<void> {
  return db.transaction('rw', db.boards, db.layers, db.sources, () =>
    getBoard(db, id).then(board => {
      const sourceIds = Object.values(board.layers).map(ly => ly.sourceId)

      db.boards.delete(id)
      db.layers
        .bulkDelete(board.layerIds)
        .then(() => db.layers.orderBy('sourceId').uniqueKeys())
        .then(sourceIdsToKeep => {
          const sourceIdsToDelete = sourceIds.filter(
            id => sourceIdsToKeep.indexOf(id) === -1
          )

          db.sources.bulkDelete(sourceIdsToDelete)
        })
    })
  )
}

export async function deleteAllBoards(db: BoardDatabase): Promise<void> {
  return db.transaction('rw', db.boards, db.layers, db.sources, () => {
    db.sources.clear()
    db.layers.clear()
    db.boards.clear()
  })
}

async function getFullBoard(db: BoardDatabase, board: DbBoard): Promise<Board> {
  const layersQuery = db.layers
    .where('id')
    .anyOf(board.layerIds)
    .toArray()

  const sourcesQuery = layersQuery.then(layers =>
    db.sources
      .where('id')
      .anyOf(layers.map(ly => ly.sourceId))
      .toArray()
  )

  return Promise.all([layersQuery, sourcesQuery]).then(([layers, sources]) => {
    const layersMap = layers.reduce((result, layer) => {
      const source = sources.find(s => s.id === layer.sourceId)
      return source
        ? {...result, [layer.id]: {...layer, source: source.contents}}
        : result
    }, {})

    return {...board, layers: layersMap}
  })
}
