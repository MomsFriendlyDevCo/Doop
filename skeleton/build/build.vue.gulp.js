/**
* Process all .vue file <script lang="js" frontend/>, <template/> and <style/> blocks
*/
let gulp = require('gulp');
let {compiler} = require('@doop/core-vue');

gulp.task('build.vue', ['load:app', 'load:app.git'], ()=>
	compiler({
		cacheCompiler: app.config.isProduction, // Reuse cached compiler in dev mode
		log: gulp.log, // Fancy logging output
		once: process.argv.slice(2).some(arg => ['build', 'build.vue'].includes(arg)), // Terminate after one build if we find this gulp task anywhere in the build chain
	})
);
