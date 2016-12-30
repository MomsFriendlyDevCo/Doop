/**
* Adds the `app.middleware.serve.images middleware
* This middleware does image specalized serving and replaces express.static()
*
* It is designed specifically to work with the HTML5 `srcset` property
* @example
* <img src="/someUnit/img/something.jpg?w=200" srcset="/someUnit/img/something.jpg?w=1000 1000w, /someUnit/img/something?w=full.jpg"/>
*
* @param {string} dir The directory from which to serve the images. This is usually something like `__dirname + '/something'` for each unit to expose a sub directory
* @param {Object} [options] An optional options object
* @param {string} [options.cache] Where to store any cached responsive images. See the code for the valid Mustache exposed properties
* @param {array} [options.extensions] An array of permitted image file extensions. The defaults are all the usual images extensions
* @param {boolean} [options.responsive=false] Whether to respond to the `?w=SIZE` query parameter which can dynamically resize images to the speicifed width. NOTE: `?w=full` is treated as a special case where the `req.query.w` option is effectively ignored entirely
* @param {array} [options.responsiveSizes=[200,1000]] An array of the permitted responsive sizes to use. Set to falsy to allow any (not recommended as this could become a potencial DDOS)An array of the permitted responsive sizes to use. Set to falsy to allow any (not recommended as this could become a potencial DDOS)
*/

var _ = require('lodash');
var async = require('async-chainable');
var colors = require('chalk');
var gm = require('gm');
var fs = require('fs');
var fspath = require('path');
var md5 = require('md5');
var mkdirp = require('mkdirp');
var mustache = require('mustache');

app.register('init', function(finish) {

	if (!app.middleware.serve) app.middleware.serve = {};

	app.middleware.serve.images = function(dir, options) {
		if (!dir || !_.isString(dir)) throw new Error('Directory to serve via app.middleware.serve.images must be a string');

		var settings = _.defaults(options, {
			root: dir,
			cache: app.config.paths.root + '/data/images/{{src.pathHash}}.{{src.ext}}',
			extensions: ['png', 'jpg', 'jpeg', 'gif', 'ico'],
			responsive: false,
			responsiveSizes: [200, 500, 1000], // Or 'false' for any requested
		});

		return function(req, res) {
			async()
				// Compute Path + sanity checks {{{
				.then('path', function(next) {
					if (req.query.w && req.query.w == 'full') delete req.query.w; // Delete `w` if its `full` anyway
					var path = fspath.join(settings.root, fspath.resolve(settings.root, req.path));
					if (!path.startsWith(settings.root)) return next([403, 'Cannot request images outside of served directory']);
					next(null, path);
				})
				// }}}
				// Compute file extension + security checks {{{
				.then('ext', function(next) {
					var ext = _.trimStart(fspath.extname(this.path), '.');
					if (!_.includes(settings.extensions, ext)) return next([404, 'File not found']); // Not a permitted extension
					next(null, ext);
				})
				// }}}
				// Check if file exists {{{
				.then('exists', function(next) {
					fs.access(this.path, function(err) {
						if (err) return next([404 ,'File not found']);
						next();
					});
				})
				// }}}
				// Deal with responsive image sets {{{
				// Determine size {{{
				.then('size', function(next) {
					if (!settings.responsive || !req.query.w) return next();
					if (!isFinite(req.query.w)) return next([400, 'Responsive `w` property must be a valid number']);
					var size = Number.parseInt(req.query.w);
					if (_.isArray(settings.responsiveSizes) && !_.includes(settings.responsiveSizes, size)) return next([403, 'Responsive size not allowed']);
					next(null, size);
				})
				// }}}
				// Compute destination path {{{
				.then('dst', function(next) {
					if (!settings.responsive || !req.query.w) return next();
					var dst = mustache.render(settings.cache, {
						src: {
							path: this.path,
							pathHash: md5(this.path + '-' + this.size),
							ext: this.ext,
						},
						dst: {
							size: this.size,
						},
					});
					if (!dst) return next('Cannot compute desination path');
					next(null, dst);
				})
				// }}}
				// Check if the dst file already exists - if it does serve that {{{
				.then(function(next) {
					if (!settings.responsive || !req.query.w) return next();
					var task = this;
					fs.access(task.dst, function(err) {
						if (err) return next();
						res.sendFile(task.dst);
					});
				})
				// }}}
				// Ensure that the path exists {{{
				.then(function(next) {
					if (!settings.responsive || !req.query.w) return next();
					mkdirp(fspath.dirname(this.dst), next);
				})
				// }}}
				// Use GraphicsMagick to resize the image to the destination path {{{
				.then(function(next) {
					if (!settings.responsive || !req.query.w) return next();
					var task = this;
					gm(task.path)
						.resize(task.size)
						.write(task.dst, function(err) {
							if (err) {
								console.log(colors.blue('[app.middleware.service.images]'), colors.red('Error generating GraphicsMagik responsive image ', err.toString(), ' - using full image instead. This may be because you dont have GraphicsMagik setup'));
								return next();
							}

							task.path = task.dst; // Mutate path to the new path
							next();
						});
				})
				// }}}
				// }}}
				// Serve file path {{{
				.then(function(next) {
					res.sendFile(this.path, next);
				})
				.end(function(err) { // Err is expected either to be falsy or an array of the status code + message
					if (err) return res.status(err[0]).send(err[1]).end();
				});
				// }}}
		};
	};

	finish();

});
