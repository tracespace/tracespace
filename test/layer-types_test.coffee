# test suite for identifying layer types
expect = require('chai').expect
LayerTypes = require '../src/layer-types'
layers = LayerTypes.layers
identify = LayerTypes.identify

KICAD_STACKUP = {
  tcu: 'board-F_Cu.gbr'
  tsm: 'board-F_Mask.gbr'
  tss: 'board-F_SilkS.gbr'
  tsp: 'board-F_Paste.gbr'
  bcu: 'board-B_Cu.gbr'
  bsm: 'board-B_Mask.gbr'
  bss: 'board-B_SilkS.gbr'
  bsp: 'board-B_Paste.gbr'
  icu: 'board-In1_Cu.gbr'
  out: 'board-Edge_Cuts.gbr'
  drl: 'board.drl'
}

OLD_EAGLE_STACKUP = {
  tcu: 'board.CMP'
  tsm: 'board.STC'
  tss: 'board.PLC'
  tsp: 'board.CRC'
  bcu: 'board.SOL'
  bsm: 'board.STS'
  bss: 'board.PLS'
  bsp: 'board.CRS'
  icu: 'board.LY2'
  out: 'board.DIM'
  drl: 'board.TXT'
}

NEW_EAGLE_STACKUP = {
  tcu: 'board.top'
  tsm: 'board.tsm'
  tss: 'board.tsk'
  tsp: 'board.tsp'
  bcu: 'board.bot'
  bsm: 'board.bsm'
  bss: 'board.bsk'
  bsp: 'board.bsp'
  icu: 'board.ly3'
  out: 'board.mil'
  drl: 'board.xln'
}

NEW_EAGLE_STACKUP_2 = {
  tcu: 'board.top'
  tsm: 'board.tsm'
  tss: 'board.tsk'
  tsp: 'board.tsp'
  bcu: 'board.bot'
  bsm: 'board.bsm'
  bss: 'board.bsk'
  bsp: 'board.bsp'
  icu: 'board.ly3'
  out: 'board.mil'
  drl: 'board.drd'
}

ALTIUM_STACKUP = {
  tcu: 'board.gtl'
  tsm: 'board.gts'
  tss: 'board.gto'
  tsp: 'board.gtp'
  bcu: 'board.gbl'
  bsm: 'board.gbs'
  bss: 'board.gbo'
  bsp: 'board.gbp'
  icu: 'board.g1'
  out: 'board.gko'
  drl: 'board.txt'
}

ALTIUM_STACKUP_2 = {
  tcu: 'board.gtl'
  tsm: 'board.gts'
  tss: 'board.gto'
  tsp: 'board.gtp'
  bcu: 'board.gbl'
  bsm: 'board.gbs'
  bss: 'board.gbo'
  bsp: 'board.gbp'
  icu: 'board.g1'
  out: 'board.gm3'
  drl: 'board.txt'
}

ORCAD_STACKUP = {
  tcu: 'board.TOP'
  tsm: 'board.SMT'
  tss: 'board.SST'
  tsp: 'board.SPT'
  bcu: 'board.BOT'
  bsm: 'board.SMB'
  bss: 'board.SSB'
  bsp: 'board.SPB'
  icu: 'board.IN1'
  out: 'board.FAB'
  drl: 'board.TAP'
}


describe 'layer types', ->
  describe 'layers object', ->
    it 'should have an object of all available layer types', ->
      expect(layers).to.have.keys [
        'tcu'
        'tsm'
        'tss'
        'tsp'
        'bcu'
        'bsm'
        'bss'
        'bsp'
        'icu'
        'out'
        'drw'
        'drl'
      ]

    it 'should have titles for each layer type', ->
      expect(layers.tcu.title).to.eql 'top copper'
      expect(layers.tsm.title).to.eql 'top soldermask'
      expect(layers.tss.title).to.eql 'top silkscreen'
      expect(layers.tsp.title).to.eql 'top solderpaste'
      expect(layers.bcu.title).to.eql 'bottom copper'
      expect(layers.bsm.title).to.eql 'bottom soldermask'
      expect(layers.bss.title).to.eql 'bottom silkscreen'
      expect(layers.bsp.title).to.eql 'bottom solderpaste'
      expect(layers.icu.title).to.eql 'inner copper'
      expect(layers.out.title).to.eql 'board outline'
      expect(layers.drw.title).to.eql 'gerber drawing'
      expect(layers.drl.title).to.eql 'drill hits'

  # try to identify layers type by filename
  describe 'layer identification', ->
    it 'should default to drw', ->
      expect(identify 'foobar').to.eql 'drw'

    it 'should identify kicad file names', ->
      for key, val of KICAD_STACKUP
        expect(identify val).to.eql key

    it 'should identify old eagle file extensions', ->
      for key, val of OLD_EAGLE_STACKUP
        expect(identify val).to.eql key

    it 'should identify new eagle file extensions', ->
      for key, val of NEW_EAGLE_STACKUP
        expect(identify val).to.eql key

    it 'should identify alternative new eagle file extensions', ->
      for key, val of NEW_EAGLE_STACKUP_2
        expect(identify val).to.eql key

    it 'should identify altium file extensions', ->
      for key, val of ALTIUM_STACKUP
        expect(identify val).to.eql key

    it 'should identify alternative altium file extensions', ->
      for key, val of ALTIUM_STACKUP_2
        expect(identify val).to.eql key

    it 'should identify orcad file extensions', ->
      for key, val of ORCAD_STACKUP
        expect(identify val).to.eql key
