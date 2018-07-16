'use strict'

// TODO: replace with Array.find once 0.10 support can be dropped
// https://github.com/nodejs/LTS#lts-schedule
var find = function (collection, predicate) {
  var i
  var element

  for (i = 0; i < collection.length; i++) {
    element = collection[i]

    if (predicate(element)) {
      return element
    }
  }
}

var layerTypes = [
  {
    id: 'tcu',
    name: {
      en: 'top copper'
    },
    match: /((F.Cu)|(copper_top)|(\.top\.gbr$))|(\.((cmp$)|(top$)|(gtl$)))|(\.toplayer\.ger$)|(top copper\.txt$)/i
  },
  {
    id: 'tsm',
    name: {
      en: 'top soldermask'
    },
    match: /((F.Mask)|(soldermask_top)|(topmask))|(\.((stc$)|(tsm$)|(gts$)|(smt$)))|(\.topsoldermask\.ger$)|(top solder resist\.txt$)/i
  },
  {
    id: 'tss',
    name: {
      en: 'top silkscreen'
    },
    match: /((F.SilkS)|(silkscreen_top)|(topsilk))|(\.((plc$)|(tsk$)|(gto$)|(sst$)))|(\.topsilkscreen\.ger$)|(top silk screen\.txt$)/i
  },
  {
    id: 'tsp',
    name: {
      en: 'top solderpaste'
    },
    match: /((F.Paste)|(solderpaste_top)|(toppaste))|(\.((crc$)|(tsp$)|(gtp$)|(spt$)))|(\.tcream\.ger$)/i
  },
  {
    id: 'bcu',
    name: {
      en: 'bottom copper'
    },
    match: /(B.Cu|(copper_bottom)|\.bottom\.gbr$)|(\.((sol$)|(bot$)|(gbl$)))|(\.bottomlayer\.ger$)|(bottom copper\.txt$)/i
  },
  {
    id: 'bsm',
    name: {
      en: 'bottom soldermask'
    },
    match: /(B.Mask|(soldermask_bottom)|bottommask\.)|(\.((sts$)|(bsm$)|(gbs$)|(smb$)))|(\.bottomsoldermask\.ger$)|(bottom solder resist\.txt$)/i
  },
  {
    id: 'bss',
    name: {
      en: 'bottom silkscreen'
    },
    match: /((B.SilkS)|(silkscreen_bottom)|(bottomsilk\.))|(\.((pls$)|(bsk$)|(gbo$)|(ssb$)))|(\.bottomsilkscreen\.ger$)|(bottom silk screen\.txt$)/i
  },
  {
    id: 'bsp',
    name: {
      en: 'bottom solderpaste'
    },
    match: /(B.Paste)|(solderpaste_bottom)|(\.((crs$)|(bsp$)|(gbp$)|(spb$)))|(\.bcream\.ger$)/i
  },
  {
    id: 'icu',
    name: {
      en: 'inner copper'
    },
    match: /(In(ner)?\d+.Cu)|(\.((ly)|(gp?)|(in))\d+$)|(\.internalplane\d+\.ger$)/i
  },
  {
    id: 'out',
    name: {
      en: 'board outline'
    },
    match: /(Edge.Cuts)|(profile)|(\.((dim$)|(mil$)|(gm(l|\d{1,2})$)|(gko$)|(fab$)))|(\.boardoutline\.ger$)|(\.outline\.gbr$)|(mechanical \d+\.txt$)/i
  },
  {
    id: 'drl',
    name: {
      en: 'drill hits'
    },
    match: /\.((fab\.gbr$)|(cnc$)|(drl$)|(xln$)|(txt$)|(tap$)|(drd$)|(exc$)|(npt$))/i
  },
  {
    id: 'drw',
    name: {
      en: 'gerber drawing'
    },
    match: /.*/
  }
]

module.exports = function whatsThatGerber (filename) {
  return find(layerTypes, function (type) {
    return type.match.test(filename)
  }).id
}

module.exports.getAllTypes = function () {
  return layerTypes.map(function (type) {
    return type.id
  })
}

module.exports.isValidType = function (type) {
  return layerTypes.some(function (layerType) {
    return layerType.id === type
  })
}

module.exports.getFullName = function whatsThatGerberTypeName (typeId, locale) {
  var type = find(layerTypes, function (type) {
    return type.id === typeId
  })

  locale = locale || 'en'

  if (!type || !type.name[locale]) {
    return ''
  }

  return type.name[locale]
}
