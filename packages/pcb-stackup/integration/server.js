// integration test server
// expects a post request with an array of gerber files
// responds with the stackup object
'use strict'

var fs = require('fs')
var path = require('path')
var hapi = require('hapi')
var inert = require('inert')

var pcbStackup = require('../index')

var PORT = 8001

var server = new hapi.Server()

server.connection({port: PORT})
server.register(inert, function () {})

server.route({
  method: 'GET',
  path: '/{param*}',
  handler: {
    directory: {
      path: path.join(__dirname, '/public'),
      redirectToSlash: true,
      index: true
    }
  }
})

server.route({
  method: 'POST',
  path: '/stackup',
  handler: function (request, reply) {
    var name = request.payload.name
    var options = request.payload.options
    var layers = request.payload.layers.map(function (layer) {
      var gerber = fs.createReadStream(layer.path)
      var type

      if (layer.options != null) {
        type = layer.options.type
      }

      return {gerber: gerber, filename: path.basename(layer.path), type: type, options: layer.options}
    })

    console.log('building stackup for: ' + name)
    pcbStackup(layers, options, function (error, stackup) {
      if (error) {
        return reply(error)
      }

      console.log('stackup done for: ' + name)
      reply(null, stackup)
    })
  }
})

server.start(function (error) {
  if (error) {
    throw error
  }

  console.log('server running at: ' + server.info.uri)
})
