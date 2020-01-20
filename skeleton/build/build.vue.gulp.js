/**
* Vue builder
* This loads all `*.vue` files thoughout the project and compiles them into `build/app.js`
*/

var _ = require('lodash');
var babel = require('gulp-babel');
var blockHead = require('gulp-block-head');
var concat = require('gulp-concat');
var crash = require('@momsfriendlydevco/crash');
var fs = require('fs');
var fspath = require('path');
var gulp = require('gulp');
var gulpIf = require('gulp-if');
var gutil = require('gulp-util');
var plumber = require('gulp-plumber');
var replace = require('gulp-replace');
var sourcemaps = require('gulp-sourcemaps');
var uglify = require('gulp-uglify');

gulp.task('build.vue', ['load:app'], ()=>
	gulp.src([
		'vendors/vue.*.js', // Early injection workers
		'**/*.vue',
		'!dist/**/*',
		'!node_modules/**/*',
	])
		// .error file generation on crash (or cleanup if everything ok) {{{
		.on('finish', ()=> fs.promises.unlink(`${app.config.paths.root}/.error`).catch(()=> null)) // Remove .error file on successful compile
		.pipe(plumber({
			errorHandler: err => {
				var trace = crash.generate(err, {
					prefix: 'ERROR DURING VUE BUILD',
					context: {
						pathRewrite: path => path.replace(/#(.*)$/, ''), // Transform `thing.js#service` -> `thing.js`
					},
				});
				process.stderr.write(trace);
				return fs.promises.writeFile(`${app.config.paths.root}/.error`, trace);
			},
		}))
		// }}}
		.pipe(gulpIf(app.config.gulp.debugJS, sourcemaps.init()))
		.pipe(replace(/0\/\* @IMPORT: (.+?) \*\//g, (junk, i) => JSON.stringify(_.get(global, i)))) // Import variables via `0/* @IMPORT: app.path */`
		.pipe(blockHead({
			default: {
				name: path => `scripts/${fspath.basename(path, '.vue')}.js`,
				transform: content => content,
			},
			backpressure: true, // Ignore backpressure as future pipe stages buffer anyway
			blocks: { // Listed in insertation order
				script: {
					sort: 0,
					// Only parse script blocks without `repack` attribute as they are handled by vendors/build.repack.gulp.js
					transform: (content, path, block) => block.attr.repack ? '' : content,
				},
				import: { // Handled by vendors/build.vendors.gulp.js
					ignore: true,
				},
				filter: {
					sort: 2,
					transform: (content, path, block) =>
						`Vue.assets.filter('${_.camelCase(block.attr.name || fspath.basename(path, '.vue'))}', ${_.trimEnd(content, ';')});`,
				},
				directive: {
					sort: 3,
					transform: (content, path, block) =>
						`Vue.assets.directive('${_.camelCase(block.attr.name || fspath.basename(path, '.vue'))}', ${_.trimEnd(content, ';')});`,
				},
				service: {
					sort: 4,
					transform: (content, path, block) => // Pass all attrs as arguments to the Vue.assets.service(id, ..., [options]) handler
						_.isEmpty(block.attr)
						? `Vue.assets.service('$${_.camelCase(block.attr.name || fspath.basename(path, '.vue'))}', ${_.trimEnd(content, ';')});`
						: `Vue.assets.service('$${_.camelCase(block.attr.name || fspath.basename(path, '.vue'))}', ${_.trimEnd(content, ';')}, ${JSON.stringify(block.attr)});`
				},
				template: {
					sort: 5,
					transform: (content, path, block) => `Vue.assets.template('${_.camelCase(block.attr.name || fspath.basename(path, '.vue'))}', '`
						+ _.trimEnd(content, ';')
							.replace(/\n/g, '\\n')
							.replace(/\t/g, '\\t')
							.replace(/'/g, "\\'")
						+ '\');',
				},
				macgyver: {
					sort: 9, // Add after templates
					transform: (content, path) =>
						`Vue.assets.macgyver('${fspath.basename(path, '.vue')}', ${_.trimEnd(content, ';')});`,
				},
				component: {
					sort: 9, // Add after templates
					transform: (content, path, block) =>
						`Vue.assets.component('${_.camelCase(block.attr.name || fspath.basename(path, '.vue'))}', `
						+ _.trimEnd(content, ';')
							.replace(/\/\*\*.*?\*\//sg, '') // Remove /** ... */ blocks
							.replace(/module.exports\s*=\s*{/, `{\n\ttemplate: Vue.assets.template('${_.camelCase(block.attr.name || fspath.basename(path, '.vue'))}'),`)
						+ ')'
				},
			},
		}))
		.pipe(replace(/\s*module.exports =\s*/, ''))
		.pipe(babel({ // Cache output and pipe though Babel
			presets: ['@babel/env'],
			plugins: [
				'@babel/plugin-proposal-optional-chaining',
				['@babel/plugin-proposal-pipeline-operator', {proposal: 'fsharp'}]
			],
		}))
		.pipe(replace(/^"use strict";\n$/m, ''))
		.pipe(concat('app.js'))
		.pipe(gulpIf(app.config.gulp.minifyJS, uglify()))
		.pipe(gulpIf(app.config.gulp.debugJS, sourcemaps.write('.')))
		.pipe(gulp.dest('./dist'))
);
