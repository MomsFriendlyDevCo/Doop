/**
* Gulpfile stub
* This file should only parse all `*.gulp.js` within the project tree
*/
var glob = require('globby');
var gulp = require('@momsfriendlydevco/gulpy').mutate();

gulp.task('default', ['serve']);

glob.sync([`${__dirname}/**/*.gulp.js`, `!${__dirname}/data`, `!${__dirname}/dist`, `!${__dirname}/node_modules`])
	.forEach(path => require(path));
