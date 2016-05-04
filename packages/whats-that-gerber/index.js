'use strict'

var layerTypes = [
  {
    id: 'drw',
    name: 'gerber drawing'
  },
  {
    id: 'tcu',
    name: 'top copper',
    match: /(F_Cu)|(\.((cmp)|(top)|(gtl)))/i
  },
  {
    id: 'tsm',
    name: 'top soldermask',
    match: /(F_Mask)|(\.((stc)|(tsm)|(gts)|(smt)))/i
  },
  {
    id: 'tss',
    name: 'top silkscreen',
    match: /(F_SilkS)|(\.((plc)|(tsk)|(gto)|(sst)))/i
  },
  {
    id: 'tsp',
    name: 'top solderpaste',
    match: /(F_Paste)|(\.((crc)|(tsp)|(gtp)|(spt)))/i
  },
  {
    id: 'bcu',
    name: 'bottom copper',
    match: /(B_Cu)|(\.((sol)|(bot)|(gbl)))/i
  },
  {
    id: 'bsm',
    name: 'bottom soldermask',
    match: /(B_Mask)|(\.((sts)|(bsm)|(gbs)|(smb)))/i
  },
  {
    id: 'bss',
    name: 'bottom silkscreen',
    match: /(B_SilkS)|(\.((pls)|(bsk)|(gbo)|(ssb)))/i
  },
  {
    id: 'bsp',
    name: 'bottom solderpaste',
    match: /(B_Paste)|(\.((crs)|(bsp)|(gbp)|(spb)))/i
  },
  {
    id: 'icu',
    name: 'inner copper',
    match: /(In\d+_Cu)|(\.((ly)|(g)|(in))\d+)/i
  },
  {
    id: 'out',
    name: 'board outline',
    match: /(Edge_Cuts)|(\.((dim)|(mil)|(gm[l\d])|(gko)|(fab)))/i
  },
  {
    id: 'drl',
    name: 'drill hits',
    match: /\.((drl)|(xln)|(txt)|(tap)|(drd))/i
  }
]

module.exports = function whatsThatGerber(filename) {
  return layerTypes.reduce(function(result, type) {
    if (type.match.test(filename)) {
      return {id: type.id, name: type.name}
    }

    return result
  })
}
