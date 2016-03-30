module.exports = function (grunt) {
 var qf_example_lib = [
  {
   cwd: 'dist/',
   src: ['**'],
   dest: '../quickforms/qf-lib/'
  },
 ];
 grunt.config.init({
  uglify: {
   build: {
    files: {
     'dist/qf-builder.min.js': 'dist/qf-builder.js',
     'dist/qf-builder-components.min.js': 'dist/qf-builder-components.js'
    }
   }
  },
  watch: {
   compass: {
    files: ['example/*.scss', 'src/*.scss'],
    tasks: ['compass'],
    options: {
     spawn: false
    }
   },
   coffee: {
    files: ['src/*.coffee', 'components/*.coffee', 'example/*.coffee'],
    tasks: ['coffee'],
    options: {
     spawn: false
    }
   }
  },
  karma: {
   min: {
    configFile: 'test/karma-min.config.coffee'
   },
   source: {
    configFile: 'test/karma.config.coffee'
   }
  }
 });

 grunt.config.set("concat", {
  options: {
   separator: ''
  },
  qqfuilder: {
   src: [
    'src/*.js'
   ],
   dest: 'dist/qf-builder.js',
  },
  qqfuilderComponents: {
   src: [
    'components/*.js'
   ],
   dest: 'dist/qf-builder-components.js',
  }
 });

 grunt.registerTask('qf_copy_to_lib', function () {
  var files = [];
  qf_example_lib.forEach(function (src) {
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
  grunt.config.set("copy." + "build_qfretouch", {
   files: files
  });
  grunt.task.run("copy:" + "build_qfretouch");
 });

 grunt.registerTask('qf_build', ['concat', 'uglify', 'qf_copy_to_lib']);
 grunt.registerTask('test', ['karma']);
 grunt.loadNpmTasks("grunt-contrib-concat");
 grunt.loadNpmTasks("grunt-contrib-copy");
 grunt.loadNpmTasks('grunt-contrib-watch');
 grunt.loadNpmTasks('grunt-karma');
 return grunt.loadNpmTasks('grunt-contrib-uglify');
};

// ---
// generated by coffee-script 1.9.2