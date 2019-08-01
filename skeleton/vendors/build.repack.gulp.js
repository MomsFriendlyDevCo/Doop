/**
* Process all .vue file <script repack/> blocks using Rollup
* NOTE: This task is quite time consuming as all dependencies must be recomputed and its tricky to tell if the destination needs recompiling
*       To avoid this we stash file stamps on each run and only do a full recompile the first time around, this can unfortunately miss dependencies at the cost of faster compile speed
*/
var _ = require('lodash');
var blockHead = require('gulp-block-head');
var gulp = require('gulp');
var fs = require('fs');
var fspath = require('path');
var rollup = require('rollup');

var runCount = 0;
gulp.task('build.repack', ['load:app'], ()=>
	Promise.resolve()
		.then(()=> runCount > 0 && fs.promises.stat('dist/vendors.repack.js').then(stat => stat.mtime).catch(()=> 0)) // Fetch last filestamp we compiled against
		.then(lowWaterMark => new Promise((resolve, reject) => {
			var code = [];
			var changedFileCount = 0;
			var waitingOn = [];

			gulp.src([
				'**/*.vue',
				'!dist/**/*',
				'!node_modules/**/*',
			])
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

									// Track file changes anyway in case any other file needs recompiling
									content
										.split('\n')
										.map(_.trim)
										.forEach(line => code.push(line));
								})
						);
					},
				},
			}))
			.on('finish', ()=> Promise.all(waitingOn) // Let all async tasks finish...
				.then(()=> {
					if (changedFileCount > 0) {
						if (runCount > 0) gulp.log('Need to repack due to', gulp.colors.cyan(changedFileCount), 'changed files');
						resolve(code.join('\n'));
					} else {
						reject('SKIP');
					}
				})
			)
		}))
		.then(importCode => fs.promises.writeFile(`${app.config.paths.root}/doop-repack.js`, importCode))
		.then(mappings => rollup.rollup({
			input: `${app.config.paths.root}/doop-repack.js`,
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
		.then(res => Promise.all([
			fs.promises.writeFile('dist/vendors.repack.js', res.output[0].code),
			fs.promises.unlink(`${app.config.paths.root}/doop-repack.js`)
		]))
		.catch(e => e === 'SKIP' ? Promise.resolve() : e)
		.finally(()=> runCount++)
);
