/**
* Actual logging library
* This library is a Monoxide addition which creates a log entry for each DB write operation
* This is attached to models to automatically create a log collection entry on each DB write
*
* @example
* var something = monoxide.schema('myMode', SPEC).use(app.middleware.logging.db)
*/

var _ = require('lodash');
var colors = require('chalk');

var logging = module.exports = {
	/**
	* Whether we are actually enabled
	* @var {Boolean}
	*/
	_enabled: true,

	/**
	* Change enabled status
	* @param {boolean} [enabled=true] The enabled status
	* @return {Object} this chainable object
	*/
	enabled: function(value) {
		logging._enabled = _.isUndefined(value) || value;
		return logging;
	},

	/**
	* Internal verbosity level
	* 0 = Off
	* 1 = Errors only (warnings about $data.user being missing mainly)
	* 2 = Log to console
	* @var {Number}
	*/
	_verbose: app.config.logging.verbose,

	/**
	* Change verbosity
	* @param {boolean} [value=false] The verbosity value
	* @return {Object} this chainable object
	*/
	verbose: function(value) {
		logging._verbose = value;
		return logging;
	},

	/**
	* Exceptions to complaining about $data.user being missing
	* @var {array}
	*/
	_allowNoUser: [
		{type: 'create', collection: 'users'}, // User signups
	],

	/**
	* Add exceptions for missing user data
	* If an array is given the entire ruleset is replaced, if an object is given it is appended as a single rule
	* @param {array|Object} rule The rule or rules to add
	* @return {Object} this chainable object
	*/
	allowNoUser: function(rule) {
		if (_.isArray(rule)) {
			logging._allowNoUser = rule;
		} else {
			logging._allowNoUser.push(rule);
		}
		return logging;
	},


	/**
	* Actual logging functionality
	* Replace this function with your own handler if you want to override the default
	* @param {Object} data logging data to save
	* @return {Object} this chainable object
	*/
	log: function(data) {
		db.logs.create(data);
	},

	/**
	* Examine a model and return only the changes
	* @param {MonoxideDocument} doc The Monoxide document
	* @return {Object} Object representing the changed keys, each value is an array of two values [newValue, oldValue]
	*/
	computePatch: function(doc) {
		var patch = {};
		if (doc.isModified) { // Looks like a Monoxide document
			doc.isModified().forEach(path => {
				patch[path] = [
					_.get(doc, path), // New value
					doc.$originalValues[path], // Old value
				];
			});
		} else {
			console.log('UNIDENTIFIED DOC DURING ' + type + ' OPERATION', doc);
		}

		return patch;
	},

	/**
	* Attempt to make the patch computed in computePatch() human readable
	* @param {Object} patch Patch object changes computed in computePatch(). This should be an object of changed keys with the value of [newValue, oldValue]
	* @return {String} Human readable string of the minified patch
	*/
	humanizePatch: function(patch) {
		return _(patch)
			.map(function(rawVal, key) {
				var val = rawVal[0];
				if (_.isUndefined(val)) {
					return; // Pass
				} else if (_.isArray(val)) {
					return key + '=Array(' + val.length + ')';
				} else if (_.isObject(val)) {
					return key + '=Object(' + _.keys(val).length + ' keys)';
				} else if (_.isBoolean(val)) {
					return key + '=' + (!!val ? 'true' : 'false');
				} else if (_.isDate(val)) {
					return key + '=' + val.toISOString();
				} else if (_.isNumber(val)) {
					return key + '=' + val;
				} else {
					if (val) return key + '="' + val.replace('"', '\\"') + '"'; // Enclose string in speachmarks
					else return key + '= Value Undefined in Logger'; //TODO: Find a fix for this
				}
			})
			.filter()
			.join(', ');
	},

	/**
	* Add logging functionality to a monoxide model
	* @param {MonoxideModel} model The model to bind to
	* @param {function} callback Callback to fire when finished binding
	*/
	setup: function(model, callback) {
		// Setup actual logging worker {{{
		var hookWatcher = function(type, query, doc) {
			// Not enabled? Do nothing
			if (!logging._enabled) return;

			var user;
			if (_.has(query, '$data.user')) {
				if (_.isNull(query.$data.user)) return; // Passed but is null - ignore (usually passed via an internal process)
				user = query.$data.user;
			} else if (logging._verbose >= 1) { // No user specified AND we should complain about it
				if (!logging._allowNoUser.some(function(rule) { // AND there is no exception for this rule
					return (rule.type == type && rule.collection == query.$collection);
				})) {
					console.log(
						colors.blue('[Logging]'),
						colors.cyan(type),
						colors.cyan(query.$collection) + '#' + colors.cyan(doc._id),
						'Warning - originating user ID missing. Set {$data: {user: req.user._id}} within the DB save calls'
					);
				}
			}

			// Compute the patch {{{
			// Patch will always be an object of changed keys, the values will be an array of [newValue, oldValue]
			// If its a new doc assume the entire doc is dirty, otherwise compute the diff
			var patch;
			if (type == 'create') {
				patch = _.mapValues(doc.toObject(), v => [v, undefined])
			} else {
				patch = logging.computePatch(doc);
			}
			// }}}

			logging.log({
				type: type,
				docId: doc._id,
				user: user,
				model: query.$collection,
				content:
					type == 'save' ? 'Save document #' + doc._id + ' - ' + logging.humanizePatch(patch)
					: type == 'create' ? 'Create document #' + doc._id + ' - ' + logging.humanizePatch(patch)
					: 'Unknown document operation on #' + doc._id + ' - ' + logging.humanizePatch(patch),
				changes: _.mapKeys(patch, (v, k) => k.replace(/\./g, '/')), // Have to replace '.' => '/' as Mongo doesnt like object keys in dotted notation
				payload: _(patch)
					.mapKeys((v, k) => k.replace(/\./g, '/'))
					.mapValues(v => v[0])
					.value(),
			});

			if (logging._verbose >= 2) {
				console.log(
					colors.blue('[Logging]'),
					colors.blue(type),
					colors.cyan(query.$collection) + '#' + colors.cyan(doc._id)
				);
				_.forEach(patch, (v, k) => {
					console.log('   ', k, colors.cyan(v[1]), '🡆', colors.cyan(v[0]));
				});
			}
		};
		// }}}

		// Bind to model hooks {{{
		model
			.hook('postCreate', function(next, query, doc) {
				setTimeout(() => hookWatcher('create', query, doc));
				next();
			})
			.hook('save', function(next, doc) {
				model.findOneByID(doc._id, function(err, original) {
					if (err) {
						console.log(colors.red('LOGGING ERROR'), 'Error when retrieving original version of ID #', doc._id, '-', err.toString());
						return next();
					}

					// Apply incomming changes to old document (so we can use isModified to work out what they were)
					_.merge(original, doc);
					setTimeout(() => hookWatcher('save', {
						$id: doc._id,
						$collection: model.$collection,
						$data: doc.$data,
					}, original));
					next();
				});
			})
		// }}}

		callback();
	},
};