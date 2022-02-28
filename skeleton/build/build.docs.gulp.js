/**
* Scan files for inline comments and build documentation 
*/
const {documenter} = require('@doop/docs');
const gulp = require('gulp');

gulp.task('build.docs', ['load:app', 'load:app.db', 'load:app.git'], ()=>
	documenter({
		log: gulp.log, // Fancy logging output
	})
);
