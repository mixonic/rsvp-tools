module.exports = function(grunt) {
  // Load grunt-microlib config & tasks
  var emberConfig = require('grunt-microlib').init.bind(this)(grunt);
  grunt.loadNpmTasks('grunt-microlib');

  // Custom phantomjs test task
  this.registerTask('test:phantom', "Runs tests through the command line using PhantomJS", [
                    'build', 'tests', 'mocha_phantomjs']);

  // Custom Node test task
  this.registerTask('test:node', ['build', 'tests', 'mochaTest']);

  this.registerTask('test', ['build', 'tests', 'mocha_phantomjs', 'mochaTest']);

  var config = {
    cfg: {
      // Name of the project
      name: 'rsvp-tools.js',

      // Name of the root module (i.e. 'rsvp-tools' -> 'lib/rsvp-tools.js')
      barename: 'rsvp-tools',

      // Name of the global namespace to export to
      namespace: 'rsvpTools'
    },
    env: process.env,

    pkg: grunt.file.readJSON('package.json'),

    mochaTest: require('./options/mocha_test.js'),
    browserify: require('./options/browserify.js'),
    mocha_phantomjs: require('./options/mocha_phantom.js')
  };

  // Merge config into emberConfig, overwriting existing settings
  grunt.initConfig(grunt.util._.merge(emberConfig, config));

  // Load custom tasks from NPM
  grunt.loadNpmTasks('grunt-browserify');
  grunt.loadNpmTasks('grunt-mocha-phantomjs');
  grunt.loadNpmTasks('grunt-mocha-test');
};
