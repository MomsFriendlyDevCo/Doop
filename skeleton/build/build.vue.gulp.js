/**
* Process all .vue file <script frontend/>, <template/> and <style/> blocks
*/
let gulp = require('gulp');
let {compiler} = require('@doop/core-vue');

gulp.task('build.vue', ['load:app', 'load:app.git'], ()=>
	compiler({
		cacheCompiler: app.config.isProduction, // Reuse cached compiler in dev mode
		log: gulp.log, // Fancy logging output
	})
);
