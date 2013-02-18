module.exports = function(grunt) {
    grunt.initConfig({
        pkg: grunt.file.readJSON('selectlist.jquery.json'),
        uglify: {
            min: {
                options: {
                    banner: '/*! <%= pkg.name %> <%= pkg.version %> */ '
                },
                files: {
                    'dist/jquery.<%= pkg.name %>-<%= pkg.version %>/scripts/jquery.<%= pkg.name %>.min.js':
                        [ 'jquery.<%= pkg.name %>.dev.js' ]
                }
            },
            plain: {
                options: {
                    beautify: true,
                    mangle: false,
                    preserveComments: 'some'
                },
                files: {
                    'dist/jquery.<%= pkg.name %>-<%= pkg.version %>/scripts/jquery.<%= pkg.name %>.js':
                        [ 'jquery.<%= pkg.name %>.dev.js' ]
                }
            }
        },
        copy: {
            dist: {
                files: [
                    {
                        expand: true, cwd: 'distfiles/', src: [ '**' ],
                        dest: 'dist/jquery.<%= pkg.name %>-<%= pkg.version %>/'
                    },
                    {
                        'dist/jquery.<%= pkg.name %>-<%= pkg.version %>/scripts/jquery.<%= pkg.name %>.dev.js':
                            [ 'jquery.<%= pkg.name %>.dev.js' ]
                    }
                ]
            }
        },
        qunit: {
            all: [ 'test/*.html' ]
        },
        compress: {
            dist: {
                options: {
                    archive: 'dist/jquery.<%= pkg.name %>-<%= pkg.version %>.zip'
                },
                files: [{
                    expand: true,
                    cwd: 'dist/',
                    src: 'jquery.<%= pkg.name %>-<%= pkg.version %>/**',
                    dest: ''
                }]
            }
        }
    });

    // Load the plugins
    grunt.loadNpmTasks('grunt-contrib-compress');
    grunt.loadNpmTasks('grunt-contrib-copy');
    grunt.loadNpmTasks('grunt-contrib-qunit');
    grunt.loadNpmTasks('grunt-contrib-uglify');

    // Default tasks
    grunt.registerTask('default', [ 'uglify', 'copy' ]);
};

