module.exports = function(grunt) {
    grunt.loadNpmTasks('grunt-screenshot');
    grunt.loadNpmTasks('grunt-contrib-pug');

    grunt.initConfig({
        pug: {
            compile: {
                options: {
                    data: {
                        presentation: true
                    }
                },
                files: {
                    'index.html': ['views/index.pug']
                }
            }
        },
        screenshot: {
            default_options: {
                options: {
                    path: 'screenshots',
                    files: [{
                        type: 'remote',
                        src: 'http://localhost:3000',
                        dest: 'intro.png',
                        delay: '500'
                    }, {
                        type: 'remote',
                        src: 'http://localhost:3000/example',
                        dest: 'stored.png',
                        delay: '3000'
                    }, {
                        type: 'remote',
                        src: 'http://localhost:3000/notebook',
                        dest: 'new.png',
                        delay: '1000'
                    }],
                    viewport: ['1920x1080', '1024x768', '640x960', '320x480']
                }
            }
        }
    });

    grunt.registerTask('default', ['screenshot', 'pug']);
};
