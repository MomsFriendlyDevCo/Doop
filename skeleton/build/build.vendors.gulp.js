var _ = require('lodash');
var blockHead = require('gulp-block-head');
var cleanCSS = require('gulp-clean-css');
var concat = require('gulp-concat');
var fs = require('fs');
var fspath = require('path');
var gulp = require('gulp');
var glob = require('globby');
var gulpIf = require('gulp-if');
var replace = require('gulp-replace');
var sourcemaps = require('gulp-sourcemaps');
var uglify = require('gulp-uglify');
var sass = require('gulp-sass');

sass.compiler = require('sass');

gulp.task('build.vendors', ['build.vendors.core', 'build.vendors.main']);
gulp.task('build.vendors.core', 'load:app', ()=> vendorBuilder(section = 'core'));
gulp.task('build.vendors.main', 'load:app', ()=> vendorBuilder(section = 'main'));


var vendorBuilder = (section = 'main') => {
	Promise.resolve()
		.then(()=> Promise.all([
			// Load from ./vendors/vendors.js {{{
			Promise.resolve(require(`${app.config.paths.root}/vendors/vendors.js`)[section]),
			// }}}
			// Load from <import/> blocks {{{
			new Promise(resolve => {
				if (section != 'main') return resolve([]); // Don't import for non-core modules
				var paths = [];

				gulp.src(glob.sync([
					'**/*.vue',
					...app.config.paths.ignore,
				]))
					.pipe(blockHead({
						blocks: {
							import: content => content.split('\n').map(_.trim).forEach(path => paths.push(path)),
						},
					}))
					.on('finish', ()=> resolve(paths))
			}),
			// }}}
		]))
		.then(paths => Promise.all(_.flatten(paths).map(path =>
			glob(path)
				.then(res => {
					if (!res.length) throw new Error(`Cannot find any matching ${section} vendor for the glob "${path}" - either you are missing a dependency or vendors/vendors.js needs updating`);
					return res;
				})
		)))
		.then(paths => _.flatten(paths))
		.then(paths => paths.map(path => fspath.normalize(path)))
		.then(paths => Promise.all([
			// JS files
			new Promise((resolve, reject) => {
				var glob = paths.filter(path => /\.js$/.test(path));
				if (!glob || !glob.length) return resolve();

				gulp.src(glob)
					.pipe(gulpIf(app.config.gulp.debugJS, sourcemaps.init()))
					.pipe(concat(`vendors.${section}.js`))
					.pipe(gulpIf(app.config.gulp.minifyJS, uglify({mangle: false, compress: {collapse_vars: false}}))) // FIXME: compress options are not normally needed. Remove this when https://github.com/mishoo/UglifyJS2/issues/3274 is resolved
					.pipe(gulpIf(app.config.gulp.debugJS, sourcemaps.write('.')))
					.pipe(gulp.dest(`${app.config.paths.root}/dist`))
					.on('end', ()=> resolve())
					.on('error', reject)
			}),

			// CSS files
			new Promise((resolve, reject) => {
				var glob = paths.filter(path => /\.css$/.test(path));
				if (!glob || !glob.length) return resolve();

				gulp.src(glob)
					.pipe(gulpIf(app.config.gulp.debugCSS, sourcemaps.init()))
					.pipe(concat(`vendors.${section}.css`))
					.pipe(gulpIf(app.config.gulp.minifyCSS, cleanCSS({
						processImport: false, // Prevents 'Broken @import declaration' error during build task
					})))
					.pipe(gulpIf(app.config.gulp.debugCSS, sourcemaps.write('.')))
					.pipe(gulp.dest(`${app.config.paths.root}/dist`))
					.on('end', ()=> resolve())
					.on('error', reject)
			}),

			// SCSS files
			new Promise((resolve, reject) => {
				var glob = paths.filter(path => /\.scss$/.test(path));
				if (!glob || !glob.length) return resolve();

				gulp.src(glob)
					.pipe(gulpIf(app.config.gulp.debugCSS, sourcemaps.init()))
					// TODO: Overwriting or appending?
					.pipe(concat(`vendors.${section}.css`))
					.pipe(sass().on('error', sass.logError))
					//.pipe(gulpIf(app.config.gulp.minifyCSS, cleanCSS({
					//	processImport: false, // Prevents 'Broken @import declaration' error during build task
					//})))
					.pipe(gulpIf(app.config.gulp.debugCSS, sourcemaps.write('.')))
					.pipe(gulp.dest(`${app.config.paths.root}/dist`))
					.on('end', ()=> resolve())
					.on('error', reject)
			}),
		]))
};
