var _ = require('lodash');
var superagent = require('superagent');

/**
* Internal router to make requests of an express endpoint within an existing Express route
*
* @param {string} [url] The relative URL path to request (always begins with a '/'). If omitted this can be specified in options.url
* @param {Object} [options] Additional options to use
* @param {string} [options.method='GET'] Method to use when requesting
* @param {Object} [options.query] Optional query elements to pass
* @param {Object} [options.body] Optional body elements to pass
* @param {string} [options.url] Optional alternative way to pass the request URL
* @param {Object} [options.req] Request object - used to copy cookie headers
* @param {boolean} [options.cookies=true] Whether to copy request cookies if options.req is specified and cookies are present
* @param {boolean} [options.handleResponseCodes=true] Return an error in the callback if the response code is anything other than 200
* @param {string} [options.accept='json'] Force the accept header to the set value, if falsy no header will be passsed
* @param {boolean} [options.raw=false] Return the raw response object not the `req.body` subkey
* @param {number} [options.redirects=5] Number of internal redirects to follow before giving up
*
* @example Fetch a list of users (as the currently logged in user)
* app.request('/api/users', (err, data) => {...});
*/
app.proxy = function(url, options, cb) {
	// Argument mangling {{{
	if (_.isString(url) && _.isObject(options) && _.isFunction(cb)) { // Form: url,options,cb
		options.url = url;
	} else if (_.isObject(url) && _.isFunction(options)) { // Form: options,cb
		cb = options;
		options = url;
	} else if (_.isString(url) && _.isFunction(options)) { // Form: url,cb
		cb = options;
		options = {url};
	} else {
		throw new Error('Unknown call pattern for app.proxy. Supported: ([url, options || options], cb)');
	}
	// }}}
	// Defaults {{{
	var settings = _.defaults(options, {
		method: 'GET',
		cookies: true,
		handleResponseCodes: true,
		accept: 'json',
		redirects: 5,
	});
	// }}}

	var requester = superagent(settings.method, settings.url);

	if (settings.cookies && settings.req && settings.req.headers.cookie) requester.set('cookie', settings.req.headers.cookie);
	if (settings.accept) requester.accept(settings.accept);
	if (settings.query) requester.query(settings.query);
	if (settings.body) requester.send(settings.body);
	if (settings.redirects) requester.redirects(settings.redirects);

	requester.end((err, res) => {
		if (err) return cb(err);
		if (settings.handleResponseCodes && res.statusCode != 200) return cb(`Unexpected status code: ${req.statusCode}`);
		cb(null, settings.raw ? res : res.body);
	});
};
