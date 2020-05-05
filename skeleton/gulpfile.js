/**
* Gulpfile stub
* This file should only parse all `*.gulp.js` within the project tree
*/
var glob = require('globby');
var gulp = require('@momsfriendlydevco/gulpy').mutate();

process.chdir(__dirname); // Always chdir to root of project so all paths are relative

gulp.task('default', 'serve');

// Include all .gulp.js files into gulp mix
glob(['**/*.gulp.js', '!data', '!dist', '!node_modules'])
	.then(paths =>
		paths.forEach(path => require(`./${path}`))
	);
