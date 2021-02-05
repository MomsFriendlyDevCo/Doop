/**
* Process all .vue file <script frontend/> blocks using Parcel
*/
var _ = require('lodash');
var glob = require('globby');
var gulp = require('gulp');
var fs = require('fs');
var fspath = require('path');
var parcel = require('parcel-bundler');

gulp.task('build.vue', ['load:app', 'load:app.git'], ()=> {
	var dumpPath = `${app.config.paths.root}/frontend.doop.vue.js`;

	return Promise.resolve()
		.then(()=> glob([
			'app/app.frontend.vue',
			'**/*.vue',
			...app.config.paths.ignore,
		]))
		.then(paths => [
			'// Auto-generated front-end import file',
			`// @date ${(new Date()).toLocaleString('en-AU', {timeZone: app.config.time.timezone})}`,
			'',
			...paths.map(path => `import '/${path}';`),
			'app.init();',
		])
		.then(content => fs.promises.writeFile(dumpPath, content.join('\n')))
		.then(()=> gulp.log('Compiling via Parcel'))
		.then(()=> new parcel(dumpPath, {
			outDir: `${app.config.paths.root}/dist`,
			publicUrl: '/dist',
			outFile: 'app.js',
			watch: false,
			cache: true,
			cacheDir: '.cache',
			minify: app.config.gulp.minifyJS,
			sourceMaps: false, // FIXME: needs to be `app.config.gulp.debugJS` disabled until https://github.com/parcel-bundler/parcel/issues/2408 closes
			autoInstall: false, // Disable install of missing deps
			detailedReport: true,
		}))
		.then(bundler => {
			bundler.cache.invalidate(`${app.config.paths.root}/services/config/config.vue`);
			bundler.addAssetType('.vue', require.resolve('./build.doop.frontend.transform'))
			return bundler.bundle();
		})
		.catch(e => e === 'SKIP' ? Promise.resolve() : Promise.reject(e))
		.finally(()=> dumpPath && fs.promises.unlink(dumpPath).catch(e => {}))
});
