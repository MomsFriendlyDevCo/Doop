/**
* Process all .vue file <script repack/> blocks using Rollup
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
var readable = require('@momsfriendlydevco/readable');
var rollup = require('rollup');

var runCount = 0;
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
		.then(()=> gulp.log('Compiling via Rollup'))
		.then(mappings => rollup.rollup({
			input: dumpPath,
			inlineDynamicImports: true,
			plugins: [
				require('rollup-plugin-replace')({
					'process.env.NODE_ENV': app.config.isProduction ? '"production"' : '"dev"',
				}),
				require('rollup-plugin-commonjs')({ // Allow reading CommonJS formatted files (this has to exist high in the load order)
					include: ['node_modules/**/*', 'demo/**/*', 'dist/**/*'], // FIXME: What goes here
				}),
				require('rollup-plugin-node-resolve')({ // Allow Node style module resolution
					browser: true, // Use the `browser` path in package.json when possible
					preferBuiltins: true,
				}),
				require('rollup-plugin-node-globals')({ // Inject global Node module shivs
					baseDir: false,
					buffer: false,
					dirname: false,
					filename: false,
					global: false,
					process: true,
				}),
				require('rollup-plugin-babel')({
					presets: ['@babel/env'],
					exclude: 'node_modules/**',
				}),
				require('rollup-plugin-uglify').uglify(),
			],
		}))
		.then(bundle => bundle.generate({
			format: 'cjs',
		}))
		.then(res => fs.promises.writeFile('dist/vendors.repack.js', res.output[0].code))
		.then(()=> fs.promises.stat('dist/vendors.repack.js'))
		.then(stat => gulp.log('Generated', gulp.colors.cyan(readable.fileSize(stat.size)), 'script via repack'))
		.catch(e => e === 'SKIP' ? Promise.resolve() : Promise.reject(e))
		.finally(()=> runCount++)
		.finally(()=> dumpPath && fs.promises.unlink(dumpPath).catch(e => {}))
});
