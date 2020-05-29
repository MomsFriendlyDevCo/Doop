/**
* Process all .vue file <script repack/> blocks using Parcel
* NOTE: This task is quite time consuming as all dependencies must be recomputed and its tricky to tell if the destination needs recompiling
*       To avoid this we stash file stamps on each run and only do a full recompile the first time around, this can unfortunately miss dependencies at the cost of faster compile speed
*/
var _ = require('lodash');
var blockHead = require('gulp-block-head');
var concat = require('gulp-concat');
var glob = require('globby');
var gulp = require('gulp');
var fs = require('fs');
var fspath = require('path');
var parcel = require('parcel-bundler');
var readable = require('@momsfriendlydevco/readable');

var runCount = 0;
var repackCache;
gulp.task('build.repack', 'load:app', ()=> {
	var dumpPath = `${app.config.paths.root}/doop.script.repack.js`;

	return Promise.resolve()
		.then(()=> runCount > 0 && fs.promises.stat('dist/vendors.repack.js').then(stat => stat.mtime).catch(()=> 0)) // Fetch last filestamp we compiled against
		.then(lowWaterMark => new Promise((resolve, reject) => {
			var changedFileCount = 0;
			var waitingOn = [];

			gulp.src(glob.sync([
				'**/*.vue',
				...app.config.paths.ignore,
			]))
			.pipe(blockHead({
				blocks: {
					script(content, path, block) {
						if (!block.attr.repack) return;

						waitingOn.push(
							fs.promises.stat(path)
								.then(stats => {
									if (!lowWaterMark || stats.mtime > lowWaterMark) {
										gulp.log('Repacking', gulp.colors.cyan(fspath.relative(app.config.paths.root, path)));
										changedFileCount++;
									}
								})
						);

						return content;
					},
				},
			}))
			.pipe(concat(fspath.basename(dumpPath)))
			.pipe(gulp.dest(fspath.dirname(dumpPath)))
			.on('finish', ()=> {
				Promise.all(waitingOn) // Let all async tasks finish...
					.then(()=> {
						if (changedFileCount > 0) {
							if (runCount > 0) gulp.log('Need to repack due to', gulp.colors.cyan(changedFileCount), 'changed files');
							resolve();
						} else {
							return Promise.reject('SKIP');
						}
					})
					.then(resolve)
					.catch(reject)
			})
		}))
		.then(()=> gulp.log('Compiling via Parcel'))
		.then(()=> new parcel(dumpPath, {
			outDir: `${app.config.paths.root}/dist`,
			outFile: 'vendors.repack.js',
			watch: false,
			cache: true,
			cacheDir: '.cache',
			minify: app.config.gulp.minifyJS,
			sourceMaps: false, // FIXME: needs to be `app.config.gulp.debugJS` disabled until https://github.com/parcel-bundler/parcel/issues/2408 closes
			autoInstall: false, // Disable install of missing deps
			detailedReport: true,
		}))
		.then(bundler => bundler.bundle())
		.then(()=> fs.promises.stat('dist/vendors.repack.js'))
		.then(stat => gulp.log('Generated', gulp.colors.cyan(readable.fileSize(stat.size)), 'script via repack'))
		.catch(e => e === 'SKIP' ? Promise.resolve() : Promise.reject(e))
		.finally(()=> runCount++)
		.finally(()=> dumpPath && fs.promises.unlink(dumpPath).catch(e => {}))
});
