var _ = require('lodash');
var async = require('async-chainable');
var monoxide = require('monoxide');

/**
* Retrieve the status schema for a given collection
* If no status schema is specified one is constructed where every status can change to every other status
* @param {string} req.params.collection The monoxide collection to retrieve / generate the schema for
* @param {string} [req.params.format='schema'] The expected output format. ENUM: 'schema', 'mermaid'
* @param {string} [req.query.highlight] Optional status to highlight
*/
app.get('/api/middleware.statusChanges/:collection/:format?', app.middleware.ensure.login, function(req, res) {
	async()
		// Sanity checks {{{
		.then(function(next) {
			if (!db[req.params.collection]) return next(404, 'Invalid collection');
			next();
		})
		// }}}
		.parallel({
			// Fetch the meta information about the collection {{{
			meta: function(next) {
				monoxide.meta({$collection: req.params.collection}, function(err, schema) {
					if (err) return next(err);
					if (!schema.status) return next('No status field in collection');
					next(null, schema);
				});
			},
			// }}}
			// Fetch the schema - if there is one defined {{{
			statusRules: function(next) {
				next(null, db[req.params.collection].get('statusRules'));
			},
			// }}}
		})
		// Combine the two {{{
		.then('schema', function(next) {
			// Use the user schema if we have one
			if (this.statusRules) return next(null, this.statusRules);

			// Compose a schema from the table meta layout if we dont
			next(null,
				_(this.meta.status.enum)
					.mapKeys(i => i)
					.mapValues(()=> ({
						changeTo: '*',
					}))
					.value()
			);
		})
		// }}}
		// Clean up spec (add default values, mangle changeTo into a collection) {{{
		.then('schema', function(next) {
			next(null, _(this.schema)
				.pickBy((s, id) => _.isPlainObject(s)) // Remove weird Angular nonsense
				.mapValues((s, id) => {
					// Mangle incomming schema with defaults + options we can easily iterate {{{
					if (!s.title) s.title = _.startCase(id);

					// Mangle .current.changeTo into a collection
					if (!s.changeTo) {
						s.changeTo = [];
					} else if (s.changeTo === '*') { // Meta mapping where every option should be exposed
						s.changeTo = _.map(this.schema, k => ({
							id: k,
							title: _.startCase(k),
						}));
					} else { // For arrays, objects or strings map the contents into a valid list of things we can change the status to
						s.changeTo = _.castArray(s.changeTo)
							.map(c => {
								var o = {};
								if (_.isString(c)) {
									o = {
										id: c,
										title: _.startCase(c),
									};
								} else if (_.isObject(c)) {
									o = c;
								} else {
									throw new Error('Unknown changeTo type: ' + (typeof c));
								}

								if (!o.class) o.class = 'btn btn-default';
								if (!o.title) o.title = _.startCase(c.id);
								return o;
							});
					}

					return s;
					// }}}
				})
				.value()
			);
		})
		// }}}
		// Allocate default value if we have one {{{
		.then(function(next) {
			if (this.meta.status && this.meta.status.default && this.schema[this.meta.status.default]) this.schema[this.meta.status.default].default = true;
			next();
		})
		// }}}
		// Mangle into mermaid format if requested {{{
		.then('schema', function(next) {
			if (!req.params.format && req.params.format != 'mermaid') return next(null, this.schema);

			next(null,
				[].concat(
					// Header
					['graph TD'],

					// Styling
					_(this.schema)
						.pickBy((s, id) => id == req.query.highlight)
						.map((s, id) => `\tstyle ${id} fill:#579ddb,stroke:#5fa2dd`)
						.value(),

					// Base ID + entity definitions
					_.map(this.schema, (s, id) => `\t${id}(${_.startCase(id)})`),

					// Linkages
					_(this.schema)
						.map((s, id) => s.changeTo.map(c => `\t${id} --> ${c.id}`))
						.flatten()
						.value()
				)
			);
		})
		// }}}
		// End {{{
		.end(function(err) {
			if (err) return res.sendError(err);
			res.send(this.schema);
		})
		// }}}
});
