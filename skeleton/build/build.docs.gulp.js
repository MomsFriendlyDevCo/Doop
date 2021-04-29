/**
* Scan files for inline comments and build documentation 
*/
let gulp = require('gulp');
let {documenter} = require('@doop/docs');

gulp.task('build.docs', ['load:app', 'load:app.db', 'load:app.git'], ()=>
	documenter({
		log: gulp.log, // Fancy logging output
	})
);
