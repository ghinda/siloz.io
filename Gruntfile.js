'use strict';
var LIVERELOAD_PORT = 35729;

module.exports = function (grunt) {
  // load all grunt tasks
  require('matchdep').filterDev('grunt-*').forEach(grunt.loadNpmTasks)

  grunt.initConfig({
    watch: {
      grunt: {
        files: [ 'Gruntfile.js' ]
      },
      livereload: {
        options: {
          livereload: LIVERELOAD_PORT
        },
        files: [
          'build/{,*/}*.{html,css,js}',
          'test/**/*.js'
        ]
      },
      css: {
        files: [
          'src/{,*/}*.css'
        ],
        tasks: [ 'stylus:server' ]
      },
      html: {
        files: [
          'src/{,*/}*.{hbs,html,md}'
        ],
        tasks: [ 'assemble:server' ]
      }
    },
    connect: {
      options: {
        port: 9000,
        hostname: '0.0.0.0'
      },
      livereload: {
        options: {
          livereload: true,
          base: [
            './build',
            './'
          ]
        }
      },
      dist: {
        options: {
          base: './build'
        }
      },
      test: {
        options: {
          base: './'
        }
      }
    },
    standard: {
      options: {
        parser: 'babel-eslint'
      },
      server: {
        src: [
          '{src,test}/{,*/}*.js'
        ]
      }
    },
    stylus: {
      options: {
        'include css': true,
        'resolve url nocheck': true,
        urlfunc: 'data-uri',
        sourcemap: {inline: true},
        import: ['nib'],
      },
      server: {
        files: {
          'build/siloz.css': 'src/app.css'
        }
      },
      dist: {
        options: {
          compress: true,
        },
        files: {
          'build/siloz.min.css': 'src/app.css'
        }
      }
    },
    browserify: {
      options: {
        browserifyOptions: {
          debug: true
        },
        transform: [ 'babelify' ]
      },
      server: {
        options: {
          watch: true
        },
        files: {
          'build/siloz.js': 'src/app.js',
          'build/vendor.js': 'src/vendor.js'
        }
      },
      dist: {
        files: {
          'build/siloz.js': 'src/app.js',
          'build/vendor.js': 'src/vendor.js'
        }
      }
    },
    uglify: {
      dist: {
        files: {
          'build/siloz.min.js': 'build/siloz.js',
          'build/vendor.min.js': 'build/vendor.js'
        }
      }
    },
    'saucelabs-mocha': {
      all: {
        options: {
          urls: [
            'http://127.0.0.1:9000/test'
          ],
          detailedError: true,
          browsers: [
            {
              browserName: 'chrome',
              platform: 'Linux'
            }, {
              browserName: 'firefox',
              platform: 'Linux'
            }, {
              browserName: 'android',
              platform: 'Linux',
              version: '5.1'
            }, {
              browserName: 'internet explorer',
              platform: 'Windows 7',
              version: '9.0'
            }, {
              browserName: 'internet explorer',
              platform: 'Windows 8',
              version: '10.0'
            }, {
              browserName: 'internet explorer',
              platform: 'Windows 10',
              version: '11.0'
            }, {
              browserName: 'safari',
              platform: 'OS X 10.11',
              version: '9.0'
            }
          ]
        }
      }
    },
    assemble: {
      options: {
        layoutdir: 'src/layouts',
        partials: 'src/partials/**',
        helpers: [
          'handlebars-helpers',
          './helper-durruti.js'
        ]
      },
      server: {
        files: [{
          expand: true,
          cwd: 'src',
          src: '{,*/}*.{hbs,md}',
          dest: 'build'
        }]
      },
      dist: {
        options: {
          data: {
            production: true
          }
        },
        files: [{
          expand: true,
          cwd: 'src',
          src: '{,*/}*.{hbs,md}',
          dest: 'build'
        }]
      }
    },
    buildcontrol: {
      options: {
        dir: 'build',
        commit: true,
        push: true
      },
      site: {
        options: {
          remote: 'git@github.com:ghinda/siloz.git',
          branch: 'gh-pages'
        }
      }
    }
  })

  grunt.registerTask('server', function (target) {
    if (target === 'dist') {
      return grunt.task.run([
        'default',
        'connect:dist:keepalive'
      ])
    }

    grunt.task.run([
      'standard',
      'browserify:server',
      'stylus:server',
      'assemble:server',
      'connect:livereload',
      'watch'
    ])
  })

  grunt.registerTask('test', [
    'default',
    'connect:test',
    'saucelabs-mocha'
  ])

  grunt.registerTask('default', [
    'standard',
    'browserify:dist',
    'uglify',
    'stylus:dist',
    'assemble:dist'
  ])

  grunt.registerTask('deploy', [
    'default',
    'buildcontrol'
  ])
}
