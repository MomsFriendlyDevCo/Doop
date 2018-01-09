var _ = require('lodash').mixin(require('lodash-keyarrange'));
var async = require('async-chainable');
var colors = require('chalk');
var monoxide = require('monoxide');
var moment = require('moment');
var sha1 = require('sha1');

var requestCaches = module.exports = monoxide.schema('requestCaches', {
	created: {type: Date, default: Date.now},
	expires: {type: Date, default: ()=> moment().add(2, 'days').toDate()},
	type: {type: 'string', index: true},
	hash: {type: 'string', index: {unique: true}},
	response: {type: 'mixed'},
});

/**
* Searches the database for a hashed version of query and if not found uses `freshCallback(next)` to return the value. All subsequent values will be requestCaches.
* The handler is then expected to perform an async request and return the result that should be requestCaches as its response
* This function can be thought of as a `if (requestCachesExists) { callback(response) } else { freshCallback(callback) }` wrapper
* If the requestCaches response is found callback is called instead, bypassing the request
* NOTE: This function will also check the expiry of the request
* @param {string} type The identifiable type of request
* @param {Object} query A complex object which will be hashed
* @param {function} freshCallback() The callback handler to call if a requestCaches response is NOT found
* @param {function} callback(response) The callback handler to call if a requestCaches response is found
*/
requestCaches.runConditional =  function(type, query, freshCallback, callback) {
	async()
		// Compute the hash {{{
		.then('hash', function(next) {
			next(null, sha1(type + '-' + JSON.stringify(_.keyArrange(query))));
		})
		// }}}
		// Fetch the existing requestCaches value (if any) {{{
		.then('requestCaches', function(next) {
			db.requestCaches.findOne({hash: this.hash, $errNotFound: false}, next);
		})
		// }}}
		// Optionally run the freshCallback and fetch the response - or return the existing response {{{
		.set('existingrequestCaches', false)
		.then('callbackResponse', function(next) {
			if (this.requestCaches && new Date() > this.requestCaches.expires) {
				if (app.isServer) console.log(colors.blue('[requestCaches]'), 'cache for query', colors.cyan(this.hash), colors.grey('(' + type + ')'), 'has expired - making fresh request');
				this.requestCaches.delete(function(err) { // Delete the existing record before continuing
					if (err) return next(err);
					freshCallback(next);
				});
			} else if (this.requestCaches) {
				if (app.isServer) console.log(colors.blue('[requestCaches]'), 'using cached response for query', colors.cyan(this.hash), colors.grey('(' + type + ')'));
				this.existingrequestCaches = true;
				next(null, this.requestCaches.response);
			} else {
				if (app.isServer) console.log(colors.blue('[requestCaches]'), 'making fresh request for query', colors.cyan(this.hash), colors.grey('(' + type + ')'));
				freshCallback(next);
			}
		})
		// }}}
		// Store the new respnse {{{
		.then(function(next) {
			if (this.existingrequestCaches) return next(); // Used existing requestCaches - no need to create a new one

			db.requestCaches.create({
				$refetch: false,
				hash: this.hash,
				type: type,
				response: this.callbackResponse,
			}, next);
		})
		// }}}
		// End - call the callback with the final result {{{
		.end(function(err) {
			if (err) return callback(err);
			callback(null, this.callbackResponse);
		});
		// }}}
};

/**
* Remove all expired cache entries from the database
*/
requestCaches.clean = function(callback) {
	db.requestCaches.remove({
		expires: {$lt: new Date()},
	}, callback);
};


/**
* Remove ALL cache entries from the database even if they are still valid
*/
requestCaches.nuke = function(callback) {
	// Monoxide will refuse to nuke everything so we have to disable that setting then re-enable it later
	var oldRemoveAll = monoxide.settings.removeAll;
	monoxide.settings.removeAll = true;
	db.requestCaches.remove({}, function(err) {
		monoxide.settings.removeAll = oldRemoveAll;
		callback(err);
	});
};
