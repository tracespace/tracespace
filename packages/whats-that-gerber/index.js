'use strict'

// TODO: replace with Array.find once 0.10 support can be dropped
// https://github.com/nodejs/LTS#lts-schedule
var find = function(collection, predicate) {
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
    match: /((F.Cu)|(top\.gbr$))|(\.((cmp$)|(top$)|(gtl$)))|(\.toplayer\.ger$)/i
  },
  {
    id: 'tsm',
    name: {
      en: 'top soldermask'
    },
    match: /((F.Mask)|(topmask))|(\.((stc$)|(tsm$)|(gts$)|(smt$)))|(\.topsoldermask\.ger$)/i
  },
  {
    id: 'tss',
    name: {
      en: 'top silkscreen'
    },
    match: /((F.SilkS)|(topsilk))|(\.((plc$)|(tsk$)|(gto$)|(sst$)))|(\.topsilkscreen\.ger$)/i
  },
  {
    id: 'tsp',
    name: {
      en: 'top solderpaste'
    },
    match: /((F.Paste)|(toppaste))|(\.((crc$)|(tsp$)|(gtp$)|(spt$)))|(\.tcream\.ger$)/i
  },
  {
    id: 'bcu',
    name: {
      en: 'bottom copper'
    },
    match: /(B.Cu|bottom\.gbr$)|(\.((sol$)|(bot$)|(gbl$)))|(\.bottomlayer\.ger$)/i
  },
  {
    id: 'bsm',
    name: {
      en: 'bottom soldermask'
    },
    match: /(B.Mask|bottommask\.)|(\.((sts$)|(bsm$)|(gbs$)|(smb$)))|(\.bottomsoldermask\.ger$)/i
  },
  {
    id: 'bss',
    name: {
      en: 'bottom silkscreen'
    },
    match: /((B.SilkS)|(bottomsilk\.))|(\.((pls$)|(bsk$)|(gbo$)|(ssb$)))|(\.bottomsilkscreen\.ger$)/i
  },
  {
    id: 'bsp',
    name: {
      en: 'bottom solderpaste'
    },
    match: /(B.Paste)|(\.((crs$)|(bsp$)|(gbp$)|(spb$)))|(\.bcream\.ger$)/i
  },
  {
    id: 'icu',
    name: {
      en: 'inner copper'
    },
    match: /(In(ner)?\d+.Cu)|(\.((ly)|(g)|(in))\d+$)|(\.internalplane\d+\.ger$)/i
  },
  {
    id: 'out',
    name: {
      en: 'board outline'
    },
    match: /((Edge.Cuts)|(outline))|(\.((dim$)|(mil$)|(gm[l\d]$)|(gko$)|(fab$)))|(\.boardoutline\.ger$)/i
  },
  {
    id: 'drl',
    name: {
      en: 'drill hits'
    },
    match: /\.((fab\.gbr$)|(cnc$)|(drl$)|(xln$)|(txt$)|(tap$)|(drd$)|(exc$))/i
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
  return find(layerTypes, function(type) {
    return type.match.test(filename)
  }).id
}

module.exports.getAllTypes = function() {
  return layerTypes.map(function(type) {
    return type.id
  })
}

module.exports.isValidType = function(type) {
  return layerTypes.some(function(layerType) {
    return layerType.id === type
  })
}

module.exports.getFullName = function whatsThatGerberTypeName(typeId, locale) {
  var type = find(layerTypes, function(type) {
    return type.id === typeId
  })

  locale = locale || 'en'

  if (!type || !type.name[locale]) {
    return ''
  }

  return type.name[locale]
}
