/**
* Generic build instructions
* This file really just points to whats involved when building things
*/

var gulp = require('gulp');

gulp.task('build', 'npm.engineCheck', 'build.vue');
