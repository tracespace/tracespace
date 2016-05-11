'use strict'

var layerTypes = [
  {
    id: 'tcu',
    name: {
      en: 'top copper'
    },
    match: /(F_Cu)|(\.((cmp)|(top)|(gtl)))/i
  },
  {
    id: 'tsm',
    name: {
      en: 'top soldermask'
    },
    match: /(F_Mask)|(\.((stc)|(tsm)|(gts)|(smt)))/i
  },
  {
    id: 'tss',
    name: {
      en: 'top silkscreen'
    },
    match: /(F_SilkS)|(\.((plc)|(tsk)|(gto)|(sst)))/i
  },
  {
    id: 'tsp',
    name: {
      en: 'top solderpaste'
    },
    match: /(F_Paste)|(\.((crc)|(tsp)|(gtp)|(spt)))/i
  },
  {
    id: 'bcu',
    name: {
      en: 'bottom copper'
    },
    match: /(B_Cu)|(\.((sol)|(bot)|(gbl)))/i
  },
  {
    id: 'bsm',
    name: {
      en: 'bottom soldermask'
    },
    match: /(B_Mask)|(\.((sts)|(bsm)|(gbs)|(smb)))/i
  },
  {
    id: 'bss',
    name: {
      en: 'bottom silkscreen'
    },
    match: /(B_SilkS)|(\.((pls)|(bsk)|(gbo)|(ssb)))/i
  },
  {
    id: 'bsp',
    name: {
      en: 'bottom solderpaste'
    },
    match: /(B_Paste)|(\.((crs)|(bsp)|(gbp)|(spb)))/i
  },
  {
    id: 'icu',
    name: {
      en: 'inner copper'
    },
    match: /(In\d+_Cu)|(\.((ly)|(g)|(in))\d+)/i
  },
  {
    id: 'out',
    name: {
      en: 'board outline'
    },
    match: /(Edge_Cuts)|(\.((dim)|(mil)|(gm[l\d])|(gko)|(fab)))/i
  },
  {
    id: 'drl',
    name: {
      en: 'drill hits'
    },
    match: /\.((drl)|(xln)|(txt)|(tap)|(drd))/i
  },
  {
    id: 'drw',
    name: {
      en: 'gerber drawing'
    },
    match: /.*/
  }
]

module.exports = function whatsThatGerber(filename) {
  return layerTypes.find(function(type) {
    return type.match.test(filename)
  }).id
}

module.exports.fullName = function whatsThatGerberTypeName(typeId, locale) {
  var type = layerTypes.find(function(type) {
    return type.id === typeId
  })

  locale = locale || 'en'

  if (!type || !type.name[locale]) {
    return ''
  }

  return type.name[locale]
}
