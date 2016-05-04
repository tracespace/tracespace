// visual test server
'use strict'

var fs = require('fs')
var path = require('path')
var glob = require('glob')
var hapi = require('hapi')
var inert = require('inert')
var async = require('async')
var partial = require('lodash.partial')
var template = require('lodash.template')
var groupBy = require('lodash.groupby')

var gerberToSvg = require('../lib/gerber-to-svg')

var PORT = 4242
var GERBER_DIR = 'gerber'
var EXPECTED_DIR = 'expected'
var TEMPLATE = 'index.html.template'

var compiledTemplate = template(fs.readFileSync(path.join(__dirname, TEMPLATE)))
var server = new hapi.Server()

var readGerber = function(gerberFile, done) {
  fs.readFile(gerberFile, 'utf8', done)
}

var renderGerber = function(gerberFile, done) {
  var renderOptions = {
    id: path.basename(gerberFile),
    optimizePaths: true
  }
  
  gerberToSvg(fs.createReadStream(gerberFile), renderOptions, done)
}

var getExpected = function(dirname, basename, done) {
  var dir = dirname.replace(GERBER_DIR + '/', EXPECTED_DIR + '/')
  var expected = path.join(__dirname, dir, basename + '.svg')

  fs.readFile(expected, 'utf8', done)
}

var renderTestFiles = function(done) {
  glob('**/*.@(gbr|drl)', {cwd: __dirname}, function(error, files) {
    if (error) {
      return done(error)
    }

    async.map(files, function(file, next) {
      var dir = path.dirname(file)
      var category = path.basename(dir).split('-').join(' ')
      var ext = path.extname(file)
      var base = path.basename(file, ext)
      var name = base.split('-').join(' ')

      file = path.join(__dirname, file)

      async.parallel({
        gerber: partial(readGerber, file),
        render: partial(renderGerber, file),
        expected: partial(getExpected, dir, base)
      }, function(error, results) {
        if (error) {
          console.error('Error with ' + file + ' : ' + error.message)
          results = {gerber: '', render: '', expected: ''}
        }

        results.name = name
        results.category = category
        next(null, results)
      })
    },
    function(error, results) {
      if (error) {
        return done(error)
      }

      done(null, groupBy(results, 'category'))
    })
  })
}

server.connection({
  port: PORT
})

server.register(inert, function(error) {
  if (error) {
    throw error
  }

  server.route({
    method: 'GET',
    path: '/',
    handler: function(request, reply) {
      renderTestFiles(function(error, suite) {
        if (error) {
          return reply(error)
        }
        reply(compiledTemplate({suite: suite}))
      })
    }
  })

  server.route({
    method: 'GET',
    path: '/style.css',
    handler: {
      file: path.join(__dirname, 'style.css')
    }
  })

  server.start(function() {
    console.log('visual test server running at:', server.info.uri)
  })
})
