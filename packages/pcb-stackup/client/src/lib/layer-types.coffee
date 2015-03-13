# identify a layer given its filename
layers = {
  tcu: {
    title: 'top copper'
    match: /(F_Cu)|(\.((cmp)|(top)|(gtl)))/i
  }
  tsm: {
    title: 'top soldermask'
    match: /(F_Mask)|(\.((stc)|(tsm)|(gts)|(smt)))/i
  }
  tss: {
    title: 'top silkscreen'
    match: /(F_SilkS)|(\.((plc)|(tsk)|(gto)|(sst)))/i
  }
  tsp: {
    title: 'top solderpaste'
    match: /(F_Paste)|(\.((crc)|(tsp)|(gtp)|(spt)))/i
  }
  bcu: {
    title: 'bottom copper'
    match: /(B_Cu)|(\.((sol)|(bot)|(gbl)))/i
  }
  bsm: {
    title: 'bottom soldermask'
    match: /(B_Mask)|(\.((sts)|(bsm)|(gbs)|(smb)))/i
  }
  bss: {
    title: 'bottom silkscreen'
    match: /(B_SilkS)|(\.((pls)|(bsk)|(gbo)|(ssb)))/i
  }
  bsp: {
    title: 'bottom solderpaste'
    match: /(B_Paste)|(\.((crs)|(bsp)|(gbp)|(spb)))/i
  }
  icu: {
    title: 'inner copper'
    match: /(In\d+_Cu)|(\.((ly)|(g)|(in))\d+)/i
  }
  out: {
    title: 'board outline'
    match: /(Edge_Cuts)|(\.((dim)|(mil)|(gko)|(drd)))/i}
  drl: {
    title: 'drill hits'
    match: /\.((drl)|(xln)|(txt)|(tap))/i
  }
  drw: {
    title: 'gerber drawing'
  }
}

identify = (name) ->
  for key, val of layers
    return key if val.match? and val.match.test name
  # return drawring by default
  'drw'

module.exports = {layers: layers, identify: identify}
