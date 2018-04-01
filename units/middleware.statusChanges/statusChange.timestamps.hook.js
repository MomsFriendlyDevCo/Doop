var _ = require('lodash');

/**
* Simple Database middleware to store the date that a timestramp changed in the object
* @param {string} [key='status'] The key to monitor for changes
* @param {function} [path] The string path to save to or a function called as (doc, settings) which returns the path. Defaults to saving the timestamp as `timestamps.${doc.status}`
*/
app.register('preModels', function(finish) {
	_.set(app, 'middleware.db.statusChange.timestamps', function(options) {
		// Settings {{{
		var settings = _.defaults(options, {
			key: 'status',
			path: doc => `timestamps.${doc.status}`,
		});
		// }}}

		return function(done, doc) {
			if (!doc[settings.key]) return done(); // Not changing status

			_.set(doc, settings.path(doc, settings), new Date());
			done();
		};
	});

	finish();
});
