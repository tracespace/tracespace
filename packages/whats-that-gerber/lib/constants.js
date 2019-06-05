'use strict'

module.exports = {
  // layer types
  TYPE_COPPER: 'copper',
  TYPE_SOLDERMASK: 'soldermask',
  TYPE_SILKSCREEN: 'silkscreen',
  TYPE_SOLDERPASTE: 'solderpaste',
  TYPE_DRILL: 'drill',
  TYPE_OUTLINE: 'outline',
  TYPE_DRAWING: 'drawing',

  // board sides
  SIDE_TOP: 'top',
  SIDE_BOTTOM: 'bottom',
  SIDE_INNER: 'inner',
  SIDE_ALL: 'all',

  // cad packages
  // internal use only, for now
  _CAD_KICAD: 'kicad',
  _CAD_ALTIUM: 'altium',
  _CAD_ALLEGRO: 'allegro',
  _CAD_EAGLE: 'eagle',
  _CAD_EAGLE_LEGACY: 'eagle-legacy',
  _CAD_EAGLE_OSHPARK: 'eagle-oshpark',
  _CAD_EAGLE_PCBNG: 'eagle-pcbng',
  _CAD_GEDA_PCB: 'geda-pcb',
  _CAD_ORCAD: 'orcad',
  _CAD_DIPTRACE: 'diptrace',
}
