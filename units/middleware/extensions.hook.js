var _ = require('lodash');
var fspath = require('path');

app.register('init', function(finish) {

	/**
	* Restrict a middleware chain to only serve the given file extensions
	* File extensions can optionally begin with '.', if this is omitted it will be added automatically
	* @param {string|array} extension... Either a single extension or an array of permitted extensions
	*/
	app.middleware.extensions = function() {
		var allowed = _(arguments)
			.flatten()
			.map(i => i.startsWith('.') ? i : '.' + i) // Ensure each arg has a '.' prefix
			.mapKeys((v, k) => v)
			.mapValues((v, k) => true)
			.value();

		return function(req, res, next) {
			var ext = fspath.extname(req.path);

			if (allowed[ext]) {
				return next();
			} else {
				res.sendError(404, 'Not found');
			}
		};
	};

	finish();
});