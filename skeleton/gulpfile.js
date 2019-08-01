/**
* Gulpfile stub
* This file should only parse all `*.gulp.js` within the project tree
*/
var glob = require('glob');
var gulp = require('@momsfriendlydevco/gulpy').mutate();

gulp.task('default', ['serve']);

glob.sync(__dirname + '/**/*.gulp.js', {ignore: ['node_modules']})
	.forEach(path => require(path));
