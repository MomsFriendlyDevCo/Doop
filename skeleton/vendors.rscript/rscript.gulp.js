var gulp = require('gulp');
var exec = require('@momsfriendlydevco/exec');

gulp.task('rscript', 'rscript:start');

gulp.task('rscript:start', ()=> Promise.resolve()
	.then(()=> gulp.log('Building image'))
	.then(()=> exec([
		'docker',
		'build',
		'--tag=rscript:latest',
		'vendors.rscript/context',
	], {
		log: gulp.log.bind(this, '[RSCRIPT]')
	}))
);
