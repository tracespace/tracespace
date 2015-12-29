// example layer filenames used in layer-types_test.js
'use strict'

module.exports = {
  kicad: [
    {
      tcu: 'board-F_Cu.gbr',
      tsm: 'board-F_Mask.gbr',
      tss: 'board-F_SilkS.gbr',
      tsp: 'board-F_Paste.gbr',
      bcu: 'board-B_Cu.gbr',
      bsm: 'board-B_Mask.gbr',
      bss: 'board-B_SilkS.gbr',
      bsp: 'board-B_Paste.gbr',
      icu: 'board-In1_Cu.gbr',
      out: 'board-Edge_Cuts.gbr',
      drl: 'board.drl'
    }
  ],
  eagle: [
    {
      tcu: 'board.CMP',
      tsm: 'board.STC',
      tss: 'board.PLC',
      tsp: 'board.CRC',
      bcu: 'board.SOL',
      bsm: 'board.STS',
      bss: 'board.PLS',
      bsp: 'board.CRS',
      icu: 'board.LY2',
      out: 'board.DIM',
      drl: 'board.TXT'
    },
    {
      tcu: 'board.top',
      tsm: 'board.tsm',
      tss: 'board.tsk',
      tsp: 'board.tsp',
      bcu: 'board.bot',
      bsm: 'board.bsm',
      bss: 'board.bsk',
      bsp: 'board.bsp',
      icu: 'board.ly3',
      out: 'board.mil',
      drl: 'board.xln'
    },
    {
      tcu: 'board.top',
      tsm: 'board.tsm',
      tss: 'board.tsk',
      tsp: 'board.tsp',
      bcu: 'board.bot',
      bsm: 'board.bsm',
      bss: 'board.bsk',
      bsp: 'board.bsp',
      icu: 'board.ly3',
      out: 'board.mil',
      drl: 'board.drd'
    }
  ],
  alitum: [
    {
      tcu: 'board.gtl',
      tsm: 'board.gts',
      tss: 'board.gto',
      tsp: 'board.gtp',
      bcu: 'board.gbl',
      bsm: 'board.gbs',
      bss: 'board.gbo',
      bsp: 'board.gbp',
      icu: 'board.g1',
      out: 'board.gko',
      drl: 'board.txt'
    },
    {
      tcu: 'board.gtl',
      tsm: 'board.gts',
      tss: 'board.gto',
      tsp: 'board.gtp',
      bcu: 'board.gbl',
      bsm: 'board.gbs',
      bss: 'board.gbo',
      bsp: 'board.gbp',
      icu: 'board.g1',
      out: 'board.gm3',
      drl: 'board.txt'
    }
  ],
  orcad: [
    {
      tcu: 'board.TOP',
      tsm: 'board.SMT',
      tss: 'board.SST',
      tsp: 'board.SPT',
      bcu: 'board.BOT',
      bsm: 'board.SMB',
      bss: 'board.SSB',
      bsp: 'board.SPB',
      icu: 'board.IN1',
      out: 'board.FAB',
      drl: 'board.TAP'
    }
  ]
}
