/**
* Generic build instructions
* This file really just points to whats involved when building things
*/

var gulp = require('gulp');

gulp.task('build', ['build.css', 'build.fonts', 'build.repack', 'build.vendors', 'build.vue']);
