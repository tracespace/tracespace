# build a board shape in a single path
# takes an array of path objects and attempts to rearrange them in a way that
# yields a single path comprised of manifold loops. if no valid rearrangment is
# found, it will return the original array
gatherPoints = require './_gather-points'
traversePoints = require './_traverse-points'

# combine two paths' data arrays
# should only be used on paths with the same strokewidth
combinePaths = (src, target) ->
  src.path.d = src.path.d.concat target.path.d

boardShape = (paths) ->
  # coombine paths with the same stroke-width
  pathHash = {}
  while paths.length
    p = paths.pop()
    tool = p.path['stroke-width']
    if pathHash[tool]?
      combinePaths pathHash[tool], p
    else
      pathHash[tool] = p

  # loop through the path hash and gather manifold flags
  manifolds = []
  for key, p of pathHash
    traversal = traversePoints gatherPoints p.path.d
    p.path.d = traversal.path
    manifolds.push traversal.manifold
    paths.push p

  # return the manifolds array
  manifolds

module.exports = boardShape
