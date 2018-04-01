/**
* Middleware for SecurityLite™ which only allows passthough if the user has a given permission in `req.user.permissions` and it is true
* Permission strings can also be any valid brace-expansion (Bash syntax) like string (See https://www.npmjs.com/package/brace-expansion)
*
* NOTE: This function is actually a middleware factory which returns the compiled function
* @param {string|array} perms A permission or array of permissions. If an array is used ALL permissions must pass to continue
* @example
* app.get('/some/url', app.middleware.ensure.can('somePermission'), (req, res) => res.send('OK'));
*/

var _ = require('lodash');
var braceExpansion = require('brace-expansion');

app.register('preControllers', function(finish) {
	_.set(app.middleware, 'ensure.can', function(perms) {
		var validPerms = _(perms)
			.castArray(perms)
			.map(e => braceExpansion(e))
			.flatten()
			.value();

		return function(req, res, next) {
			if (!req.user || !validPerms.every(p => req.user.permissions[p])) return app.middleware.ensure.authFail(req, res);
			next();
		};
	});

	finish();
});