/**
* Gulpfile stub
* This file should only parse all `*.gulp.js` within the project tree
*/
const glob = require('globby');
const gulp = require('@momsfriendlydevco/gulpy').mutate();

process.chdir(__dirname); // Always chdir to root of project so all paths are relative

gulp.task('default', 'serve');

// Include all .gulp.js files into gulp mix
glob.sync([
	'**/*.gulp.js',
	'!data',
	'!dist',
	'(!node_modules|./node_modules/@doop/**/*.gulp.js)',
]).forEach(path => require(`./${path}`))
