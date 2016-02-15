/// <binding />
module.exports = function (grunt) {
    var releaseFolder = '../bin/Release/';
    var production_debug_sources = [
     {
         cwd: 'bower_components/',
         src: ['**'],
         dest: '../bin/Debug/bower_components'
     },
    ];

    var production_build_sources = [
         {
             name: 'build_qf-retouch',
             cwd: 'qf-retouch/',
             src: [
                 '**/*.html',
                 '**/img/**',
                 '**/icons/**',
                 '**/fonts/**',
             ],
             dest: releaseFolder + 'qf-retouch'
         },
         {
             name: 'build_index',
             cwd: '',
             src: [
                 'default.html',
             ],
             dest: '../bin/Release'
         },
         {
             name: 'build_bower_components',
             cwd: 'bower_components/',
             src: [
                 'jquery/dist/jquery.min.js',
                 'angular/angular.min.js',
                 'bootstrap/dist/js/bootstrap.min.js',
                 'angular-bootstrap/ui-bootstrap-tpls.min.js',
                 'angular-ui-router/release/angular-ui-router.min.js',
                 'angular-resource/angular-resource.min.js',
                 'satellizer/satellizer.min.js',
                 'ocLazyLoad/dist/ocLazyLoad.min.js',
                 'angular-cookies/angular-cookies.min.js',
                 'angular-animate/angular-animate.min.js',
                 'angular-tree-control/angular-tree-control.js', //problem
                 'ng-contextmenu/dist/ng-contextmenu.min.js',
                 'angular-file-upload/dist/angular-file-upload.min.js', //problem
                 'angular-translate/angular-translate.min.js',
                 'ag-grid/dist/ag-grid.min.js',
                 'angular-ui-grid/ui-grid.min.js',
                 'domready/ready.min.js',
                 'angular-local-storage/dist/angular-local-storage.min.js',
                 'angular-xeditable/dist/js/xeditable.min.js',
                 'hammerjs/hammer.min.js',
                 'angular-gestures/gestures.min.js',
                 'angularjs-slider/dist/rzslider.min.js',
                 //Some css in bower
                 'angular-ui-grid/ui-grid.min.css',
                 'angularjs-slider/dist/rzslider.min.css',
                 'requirejs/require.js',
                 'underscore/underscore-min.js',
             ],
             dest: releaseFolder + 'bower_components/',
             rename: function (dest, src) {
                 return dest + src.replace(/.min.js/g, '.js')
                         .replace(/.min.css/g, '.css');

             }
         },
    ];

    grunt.initConfig({
        pkg: grunt.file.readJSON("package.json"),
        options: {
            base: 'qf-retouch',
            outputDR: 'qf-retouch',
            outputAPI: 'api',
            outputBOWER: 'bower_components',
            outputSOUND: 'sound',
        },
        express: {
            all: {
                options: {
                    port: 8002,
                    hostname: "localhost",
                    bases: ['qf-retouch'],
                    livereload: true
                }
            }
        },
        sync: {
            main: {
                files:
                [
                    {
                        expand: true,
                        cwd: '<%= options.base %>',
                        src: [
                                '**'
                        ],
                        dest: '../bin/Debug/qf-retouchWebApp/<%= options.output %>'
                    }
                ],
                verbose: true,
                updateAndDelete: false,
            },
            release: {
                files:
                [
                    {
                        expand: true,
                        cwd: '../qf-retouchWebApp/<%= options.outputDR %>',
                        src: [
                                '**/*.min.js',
                                '**/*.html',
                                '**/*.min.css',
                                '**/*.png',
                                '**/*.gif',
                                '**/*.jpg',
                                '**/*.ico',
                                '**/*.woff',
                                '**/*.ttf',
                                '**/*.svg',
                                '**/*.eot',
                                '**/*.woff2',
                                '**/*.otf'
                        ],
                        dest: '../bin/Release/qf-retouchWebApp/<%= options.outputDR %>'
                    },
                    {
                        expand: true,
                        cwd: '../qf-retouchWebApp/<%= options.outputAPI %>',
                        src: [
                                '**'
                        ],
                        dest: '../bin/Release/qf-retouchWebApp/<%= options.outputAPI %>'
                    },
                    {
                        expand: true,
                        cwd: '../qf-retouchWebApp/<%= options.outputBOWER %>',
                        src: [
                                '**'
                        ],
                        dest: '../bin/Release/qf-retouchWebApp/<%= options.outputBOWER %>'
                    },
                    {
                        expand: true,
                        cwd: '../qf-retouchWebApp/<%= options.outputSOUND %>',
                        src: [
                                '**'
                        ],
                        dest: '../bin/Release/qf-retouchWebApp/<%= options.outputSOUND %>'
                    },
                    {
                        expand: false,
                        cwd: '../qf-retouchWebApp/',
                        filter: 'isFile',
                        src: [
                                '*.html',
                                '*.ico',
                                'web.config'
                        ],
                        dest: '../bin/Release/qf-retouchWebApp/'
                    }
                ],
                verbose: true,
                updateAndDelete: true,
            },
            debug: {
                files:
                [
                    {
                        expand: true,
                        cwd: '../qf-retouchWebApp/<%= options.outputDR %>',
                        src: [
                                '**'
                        ],
                        dest: '../bin/Debug/<%= options.outputDR %>'
                    },
                    {
                        expand: true,
                        cwd: '../qf-retouchWebApp/<%= options.outputBOWER %>',
                        src: [
                                '**'
                        ],
                        dest: '../bin/Debug/<%= options.outputBOWER %>'
                    },
                    {
                        expand: false,
                        cwd: '../qf-retouchWebApp/',
                        filter: 'isFile',
                        src: [
                                '*.html',
                                '*.ico',
                                'web.config'
                        ],
                        dest: '../bin/Debug/'
                    }
                ],
                verbose: true,
                updateAndDelete: true,
            },
            xampp: {
                files:
                    [
                        {
                            expand: true,
                            cwd: '../qf-retouchWebApp/<%= options.outputDR %>',
                            src: [
                                  '**'
                            ],
                            dest: 'C:/xampp/htdocs/<%= options.outputDR %>'
                        },
                        {
                            expand: true,
                            cwd: '../qf-retouchWebApp/<%= options.outputAPI %>',
                            src: [
                                    '**'
                            ],
                            dest: 'C:/xampp/htdocs/qf-retouch/<%= options.outputAPI %>'
                        },
                        {
                            expand: true,
                            cwd: '../qf-retouchWebApp/<%= options.outputBOWER %>',
                            src: [
                                    '**'
                            ],
                            dest: 'C:/xampp/htdocs/qf-retouch/<%= options.outputBOWER %>'
                        },
                        {
                            expand: true,
                            cwd: '../qf-retouchWebApp/<%= options.outputSOUND %>',
                            src: [
                                    '**'
                            ],
                            dest: 'C:/xampp/htdocs/qf-retouch/<%= options.outputSOUND %>'
                        },
                        {
                            expand: false,
                            cwd: '../qf-retouchWebApp/',
                            filter: 'isFile',
                            src: [
                                    '*.html',
                                    '*.ico',
                                    'web.config'
                            ],
                            dest: 'C:/xampp/htdocs/qf-retouch/'
                        }
                    ],
                verbose: true,
                updateAndDelete: true,
            },

        },
        watch: {
            sync: {
                files: [
                    'qf-retouch/**/*.js',
                    'qf-retouch/**/*.html',
                    'qf-retouch/**/*.css',
                    '!qf-retouch/node_modules/**',
                    '!qf-retouch/bower_components'
                ],
                options: {
                    livereload: true
                },
                tasks: ['sync:debug']
            }
        }
    });


    grunt.registerTask('build_copy', function () {
        var files = [];
        production_build_sources.forEach(function (src) {
            files.push(
                    {
                        expand: true,
                        cwd: src.cwd,
                        src: src.src,
                        dest: src.dest,
                        rename: src.rename
                    });
        });
        //grunt.log.writeln('...', files);
        grunt.config.set("copy." + "build_qf-retouch", {
            files: files
        });
        grunt.task.run("copy:" + "build_qf-retouch");
    });

    grunt.config("uglify", {
        build: {
            options: {
                mangle: false
            },
            files: [
             {
                 expand: true,
                 //flatten: true,
                 cwd: 'qf-retouch',
                 src: ['**/*.js'],
                 dest: releaseFolder + 'qf-retouch',
                 ext: '.js'
             }
            ]
        }
    });

    grunt.config("cssmin", {
        target: {
            files: [{
                expand: true,
                cwd: 'qf-retouch/',
                src: [
                 'styles/qf-retouch-sass/stylesheets/app.css',
                 'styles/qf-retouch-sass/stylesheets/main.css'
                ],
                ext: '.css',
                dest: releaseFolder + 'qf-retouch'
            }]
        }
    });

    //-----------------Welcome BOT1616 FILE WATCHER-------
    var colors = ['white', 'black', 'grey', 'blue', 'cyan', 'green', 'magenta', 'red', 'yellow', 'rainbow'];


    //grunt.log.writeln(JSON.stringify(grunt.config(), null, 2));
    grunt.event.on('watch', function (action, filepath, target) {
        grunt.log.writeln(target + ': ' + filepath + ' has ' + action);
    });

    grunt.loadNpmTasks("grunt-contrib-watch");
    grunt.loadNpmTasks('grunt-contrib-copy');
    grunt.loadNpmTasks('grunt-contrib-uglify');
    grunt.loadNpmTasks('grunt-contrib-cssmin');
    grunt.loadNpmTasks("grunt-express");
    grunt.loadNpmTasks('grunt-sync');

    grunt.log.writeln('.............BOT1616 IS STARTING...............'[colors[6]].bold);

    grunt.registerTask('BOT1616_BUILD_PRODUCTION', [
       'build_copy',
       'uglify',
       'cssmin'
    ]);

    grunt.registerTask('BOT1616_WATCHER', [
        'express',
        //'open',
        'watch'
    ]);
};