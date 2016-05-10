module.exports = function(grunt) {
    grunt.loadNpmTasks('grunt-screenshot');

    grunt.initConfig({
        screenshot: {
            default_options: {
                options: {
                    path: 'screenshots',
                    files: [
                        {
                            type: 'remote',
                            src: 'http://localhost:3000',
                            dest: 'repl.png',
                            delay: '1000'
                        }
                    ],
                    viewport: ['1920x1080', '1024x768', '640x960', '320x480']
                }
            }
        }
    });

    grunt.registerTask('default', ['screenshot']);
}
