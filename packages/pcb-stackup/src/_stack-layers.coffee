# stack layers into a full board

BoundingBox = require './_bounding-box'

# stack a set of sorted layers
stackLayers = (sortedLayers, boardId = '') ->
  defs = sortedLayers.defs
  layers = sortedLayers.layers
  bBox = new BoundingBox()
  scale = null
  units = null
  mechMask = null
  maskId = null
  group = []
  manifoldOutline = false

  # layers
  cu = layers.cu
  sm = layers.sm
  ss = layers.ss
  sp = layers.sp
  out = layers.out
  drl = layers.drl

  # if there's a board outline, do some rearanging
  # assume that the first manifold path determines the size
  # if this isn't the case we could run into trouble so keep an eye on this
  if out?
    manifoldFlags = out.props.manifoldFlags
    firstManifoldIndex = manifoldFlags.indexOf true
    if firstManifoldIndex isnt -1
      # we've got us a manifold path
      manifoldOutline = true
      # get the outline path and its stroke width to get an accurate size
      outlinePath = out._[firstManifoldIndex]
      halfStrokeWidth = outlinePath.path['stroke-width'] / 2
      # set board size to outline size
      scale = out.props.scale
      units = out.props.units
      bBox.add out.props.bBox
      bBox.offset -halfStrokeWidth
      # push the outline mask to the defs
      maskId = "#{out.id[0...-4]}_mech-mask"
      mechMask = {mask: {id: maskId, fill: '#fff', stroke: '#fff', _: []}}
      for p, index in out._
        if manifoldFlags[index]
          mechMask.mask['fill-rule'] = 'evenodd'
          mechMask.mask._.push {path: {'stroke-width': 0, d: p.path.d}}
        else
          mechMask.mask._.push p

  # add the copper if it exists
  if cu?
    # if the outline wasn't added, add this layer's bBox to the board Bbox
    unless manifoldOutline
      bBox.add cu.props.bBox
      # in the absence of a manifold outline, we'll use the copper layer for
      # units and scale
      # TODO: use the units and scale per layer to handle layer differences
      scale = cu.props.scale
      units = cu.props.units
    # copper layer gets used a couple times, so push it to defs
    defs.push {
      g: {id: cu.id, fill: 'currentColor', stroke: 'currentColor', _: cu._}
    }
    # push a use to group to get the copper in the image
    group.push {
      use: {class: "#{boardId}_board-cu", 'xlink:href': "##{cu.id}"}
    }

  # soldermask, copper finish, and silkscreen will only be applied if the
  # soldermask exists
  if sm?
    # get the proper bBox if we didn't have a manifold outline
    unless manifoldOutline
      bBox.add sm.props.bBox
      if ss? then bBox.add ss.props.bBox
    # create a group that contains the solder mask positibe
    smGroup = {
      g: {id: sm.id, fill: 'currentColor', stroke: 'currentColor', _: sm._}
    }
    # create a mask that removes the sm positives
    smMask = {
      mask: {
        id: "#{sm.id}_mask"
        color: '#000'
        _: [bBox.rect('#fff'), {use: {'xlink:href': "##{sm.id}"}}]
      }
    }
    # create a mask the keeps the finished copper
    cfMask = {
      mask: {
        id: "#{cu.id}_finish-mask"
        color: '#fff'
        _: [{use: {'xlink:href': "##{cu.id}"}}]
      }
    }
    # create another mask that
    # create a group that holds the sm cover and ss
    smCover = bBox.rect()
    smCover.rect.class = "#{boardId}_board-sm"
    smSsGroup = {g: {mask: "url(##{sm.id}_mask)", _: [smCover]}}
    if ss?
      ssGroup = {
        g: {
          id: ss.id
          class: "#{boardId}_board-ss"
          fill: 'currentColor'
          stroke: 'currentColor'
          _: ss._
        }
      }
      smSsGroup.g._.push ssGroup

    # create an element for the copper finish
    cf = {
      use: {
        class: "#{boardId}_board-cf"
        mask: "url(##{cfMask.mask.id})"
        'xlink:href': "##{sm.id}"
      }
    }
    # push to the group
    group.push {
      g: {
        _: [
          {defs: {_: [smGroup, smMask, cfMask]}}
          smSsGroup
          cf
        ]
      }
    }

  # add solderpaste if it exists
  if sp?
    unless manifoldOutline then bBox.add sp.props.bBox
    group.push {
      g: {
        id: sp.id
        class: "#{boardId}_board-sp"
        fill: 'currentColor'
        stroke: 'currentColor'
        _: sp._
      }
    }

  # add the board outline if we need to
  if out? and not manifoldOutline
    bBox.add out.props.bBox
    group.push {
      g: {
        id: out.id
        class: "#{boardId}_board-out"
        fill: 'currentColor'
        stroke: 'currentColor'
        _: out._
      }
    }

  # add the drill hits to the mech mask
  if drl?
    drlGroup = {g: {id: drl.id, fill: '#000', stroke: '#000', _: drl._}}
    unless mechMask?
      bBox.add drl.props.bBox
      maskId = "#{drl.id[0...-4]}_mech-mask"
      mechMask = {mask: {id: maskId, _: [bBox.rect '#fff']}}
    mechMask.mask._.push drlGroup

  # push the mechanical mask to the defs
  if mechMask? then defs.push mechMask

  # make sure the first element is a covering rect
  coverRect = bBox.rect()
  coverRect.rect.class = "#{boardId}_board-fr4"
  group.unshift coverRect

  # return the stack
  {
    defs: defs
    maskId: maskId
    group: group
    units: units
    scale: scale
    bBox: bBox
  }

module.exports = stackLayers
