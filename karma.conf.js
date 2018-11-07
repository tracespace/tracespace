module.exports = function(config) {
  config.set({
    frameworks: ['browserify', 'mocha'],

    files: ['./packages/**/*test.js'],

    exclude: ['**/integration/**'],

    preprocessors: {
      './packages/**/*test.js': ['browserify'],
    },

    browserify: {
      debug: true,
      plugin: ['proxyquire-universal'],
    },

    reporters: ['progress'],

    port: 9876,

    colors: true,

    logLevel: config.LOG_INFO,

    autoWatch: true,

    browsers: ['Chrome', 'Firefox'],

    singleRun: process.env.CI,

    concurrency: Infinity,
  })
}
