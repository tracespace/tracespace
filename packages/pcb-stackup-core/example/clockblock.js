'use strict'

var fs = require('fs')
var path = require('path')
var shortId = require('shortid')
var gerberToSvg = require('gerber-to-svg')
var whatsThatGerber = require('whats-that-gerber')
var pcbStackupCore = require('../lib')

// we've got a collection of gerber files in a directory
var gerberPaths = [
  '../integration/boards/clockblock/clockblock-F_Cu.gbr',
  '../integration/boards/clockblock/clockblock-F_Mask.gbr',
  '../integration/boards/clockblock/clockblock-F_SilkS.gbr',
  '../integration/boards/clockblock/clockblock-F_Paste.gbr',
  '../integration/boards/clockblock/clockblock-B_Cu.gbr',
  '../integration/boards/clockblock/clockblock-B_Mask.gbr',
  '../integration/boards/clockblock/clockblock-B_SilkS.gbr',
  '../integration/boards/clockblock/clockblock-Edge_Cuts.gbr',
  '../integration/boards/clockblock/clockblock.drl',
  '../integration/boards/clockblock/clockblock-NPTH.drl'
]

// pcb-stackup-core takes an array of layer objects
var buildStackup = function(layers) {
  var stackupOptions = {
    // stackup needs a unique to avoid collisions with other stackup renders
    id: shortId.generate(),
    // we're going to use the outline layer to determine the shape of the
    // board rathter than just using a rectangle that fits everything
    maskWithOutline: true,
    // these are the default colors (so there's no need to pass them in)
    // but this is how you would pass other colors in
    color: {
      fr4: '#666',
      cu: '#ccc',
      cf: '#c93',
      sm: 'rgba(0, 66, 0, 0.75)',
      ss: '#fff',
      sp: '#999',
      out: '#000'
    }
  }

  // this is where the magic happens
  var stackup = pcbStackupCore(layers, stackupOptions)

  // in a real application, try not to do synchronous stuff like this
  fs.writeFileSync(path.join(__dirname, './clockblock-top.svg'), stackup.top.svg)
  fs.writeFileSync(path.join(__dirname, './clockblock-bottom.svg'), stackup.bottom.svg)
}

// turn the gerber file paths into the layer objects pcb-stackup-core needs
var gerbers = gerberPaths.map(function(gerberPath) {
  var filename = path.join(__dirname, gerberPath)

  // we'll need a readable stream to pass into gerber-to-svg
  // we could also use a gerber file read into a string, if we so desired
  var file = fs.createReadStream(filename, {encoding: 'utf-8'})

  // we need to know the layer type (i.e. top copper? bottom silkscreen?)
  // here, we use whats-that-gerber to try to identify it from the filename
  var type = whatsThatGerber(filename)

  // each layer needs a unique ID per the requirements of gerber-to-svg
  var id = shortId.generate()

  // id and file will be used by gerber-to-svg
  // type will be used by pcb-stackup-core
  return {id: id, file: file, type: type}
})

// the layer conversion in gerber-to-svg is asynchronous, so we need to
// collect the results of the conversion and call buildStackup when we're ready
var layersRemaining = gerberPaths.length
var finishedLayers = []
var handleLayerDone = function() {
  if (--layersRemaining < 1) {
    buildStackup(finishedLayers)
  }
}

gerbers.forEach(function(gerberFile) {
  var file = gerberFile.file
  var type = gerberFile.type
  var options = {
    id: gerberFile.id,
    // we want this option to ensure maskWithOutline in the stackup options works
    // setting this to true allows the plotter to do stuff like fill in small
    // gaps, remove duplicate segments, and rearrage segments into loops
    plotAsOutline: type === 'out'
  }

  // convert the layer with a callback so we can check when everything's finished
  var converter = gerberToSvg(file, options, function(error, result) {
    if (error) {
      // probably do something with this error in real life
      void error
    }
    else {
      // notice that pcb-stackup-core needs the converter object, not the result
      // of the stream; it uses properties of the converter to generate the stackup
      finishedLayers.push({type: type, converter: converter})

      // if you wanted individual layers, you would need to do something with them here
      void result
    }

    handleLayerDone()
  })
})
