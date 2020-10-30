/**
* Agent to run a custom report and return the result
*
* @param {Object} [settings] Settings to pass to the report runner
* @param {string} [settings.file] The name of the report to run (sans `.js`). Must correspond to a file in /reports/queries
* @param {string} [settings.root=`${app.config.paths.root}/reports/queries`] The root directory when looking for settings.file
* @param {string} [settings.content] Plaintext script code to execute as a custom report - bypasses the file system and is designed for debugging only
*
* @example Run a report with fresh data and return the result
* app.agents.get('reportCustom', {report: 'fooBarBaz'}).then(result => { ... })
*
* @example Run a custom report from the command line
* >./run-agent -d reportCustom -o file=punchList_Schedule
*/
var _ = require('lodash');
var async = require('async-chainable');
var fs = require('fs');
var globby = require('globby');
//var monoxide = require('monoxide');
var traverse = require('traverse');
var vm = require('vm');
var R = require('r-script');

module.exports = {
	id: 'report',
	timing: false,
	hasReturn: true,
	show: false,
	methods: ['pm2', 'inline'],
	expires: '1h',
	worker: function(done, settings) {
		var agent = this;

		async()
			// Sanity checks {{{
			.then(function(next) {
				if (!settings) return next('No settings provided to generate custom report');
				if (!settings.file && !settings.content) return next('No file or content specified for custom report');
				next();
			})
			// }}}
			// Read file contents {{{
			.then('contents', function(next) {
				if (settings.file) {
					async()
						.then('path', next => next(null, (settings.root || `${app.config.paths.root}/reports/queries`) + `/${settings.file}.js`))
						.then(function (next) {
							globby(this.path)
								.then(files => {
									if (!files || !files.length) return next('Query file not found');
									next();
								})
								.catch(next);
						})
						.then('contents', function(next) {
							agent.progress(`Reading query file ${this.path}`);
							fs.readFile(this.path, 'utf8', next);
						})
						.end('contents', next);
				} else if (settings.content) {
					next(null, settings.content);
				} else {
					next('Either `file` or `content` must be specified');
				}
			})
			// }}}
			// Execute the script within a sandbox {{{
			.then('data', function(finishQuery) {
				// Create sandbox {{{
				agent.progress('Creating sandbox');
				var sandbox = {};
				var promises = []; // Promises made in this sandbox session (zero index should be outer resolver)

				var promiseFactory = (data, resolver) => {
					var promised = new Promise(resolver);
					promises.unshift({...data, promise: promised});
					return promised;
				};

				// Create `db.*.aggregate` chains {{{
				// FIXME: Can we wrap every method within the normal object? Proxy?
				sandbox.db = _(app.db)
					.mapValues((v, k) => ({ // Create (abbreviated db.*) object
						aggregate: query => promiseFactory({type: 'aggregate'}, (resolve, reject) => {
							agent.progress(`Run aggregation on db.${k}`);
							db[k].aggregate(query, (err, result) => {
								if (err) return reject(err);
								resolve(results.map(r => r.toObject()));
							});
							/*
							monoxide.aggregate({
								$collection: k,
								$want: 'cursor',
								$stages: query,
							}, (err, cursor) => {
								if (err) return reject(err);
								var rowCount = 0;
								cursor
									.forEach((next, item) => {
										agent.logThrottled('Recieved', agent.log.colors.cyan(rowCount++), 'results');
										next();
									})
									.exec((err, items) => {
										if (err) return reject(err);
										agent.log.flush(`Aggregate on db.${k} returned`, agent.log.colors.cyan(rowCount), 'results');
										resolve(items);
									});
							});
							*/
						}),
						find: query => promiseFactory({type: 'find'}, (resolve, reject) => {
							agent.progress(`Run find query on db.${k}`);
							db[k].find(query, (err, results) => {
								if (err) return reject(err);
								resolve(results.map(r => r.toObject()));
							});
						}),
						count: query => promiseFactory({type: 'count'}, (resolve, reject) => {
							agent.progress(`Run count query on db.${k}`);
							db[k].count(query, (err, result) => {
								if (err) return reject(err);
								resolve(result);
							});
						}),
					}))
					/*
					.thru(db => {
						var newKeys = {};

						_(db)
							.keys()
							.filter(k => /[A-Z]/.test(k)) // Only select models that have an upper case (camel) character
							.forEach(k => newKeys[k.toLowerCase()] = db[k]); // Copy lower case version into dummy DB object

						return _.assign(db, newKeys);
					})
					*/
					.value();
				// }}}

				// Create db.union {{{
				sandbox.db.union = template => promiseFactory({type: 'union'}, (resolve, reject) => {
					Promise.all(_.values(template))
						.then(results => _.mapKeys(results, (v, i) => _.keys(template)[i]))
						.then(resolve)
						.catch(reject)
				});
				// }}}

				// Raw output {{{
				sandbox.raw = query => promiseFactory({type: 'raw'}, (resolve, reject) => {
					agent.progress(`Run raw output.`);
					resolve(query);
				});
				/// }}}

				// Import Mongoose meta data types {{{
				/*
				_.keys(monoxide.mongoose.Types).forEach(t => {
					sandbox[t] = val => new monoxide.mongoose.Types[t](val);
				});
				*/
				// }}}

				// Import Mongoose shell aliased data types - no idea what the full list of these is so there are probably some missing {{{
				/*
				sandbox.ObjectId = monoxide.utilities.objectID;
				sandbox.NumberDecimal = monoxide.mongoose.Types.Decimal128.fromString;
				*/
				// }}}

				// Execute R with input {{{
				sandbox.rscript = function(query) {
					if (query) query = ',' + JSON.stringify(query);
					return new Promise((resolve, reject) => {
						var r = R(app.config.paths.root + '/reports/queries/' + settings.file + '.R');
						r.options.shell = app.config.paths.root + '/vendors.rscript/shell.sh';
						r.data(app.config, query || '');
						r.call(function(err, d) {
							if (err) {
								agent.warn('R-Script failure', err.toString());
								return reject(err);
							}
							console.log('d', d);
							resolve(d);
						});
					});
				}
				// }}}

				// Import config {{{
				sandbox.config = app.config
				// }}}

				// TODO: Raw output reports

				// }}}

				// Compile sandbox {{{
				// Do weird Node voodoo to make the sandbox into a context
				agent.progress('Compiling sandbox');
				vm.createContext(sandbox);
				// }}}

				// Run query {{{
				agent.progress('Running query');
				try {
					vm.runInContext(this.contents, sandbox);

					// See what ended up on the promise stack and execute the zero-position (presumably outer) one
					if (!promises.length) {
						finishQuery('Could not find any queries to run');
					} else { // Attach to last promise and wait for it to resolve
						promises[0].promise
							.then(result => finishQuery(null, result))
							.catch(finishQuery);
					}
				} catch (e) {
					finishQuery(e.toString());
				}
				// }}}

				// NOTE: We do not have a next() call here as that is actually enclosed within the finish pointer within the query
			})
			// }}}
			// Message that we received some data back {{{
			.then(function(next) {
				agent.progress('Query complete');
				if (_.isArray(this.data)) {
					agent.log('Received array with', agent.log.colors.cyan(this.data.length), 'items');
				} else if (_.isObject(this.data)) {
					agent.log('Received object with', agent.log.colors.cyan(Object.keys(this.data).length), 'keys');
				}
				next();
			})
			// }}}
			// Translate complex objects into strings {{{
			/*
			// TODO: Is any sanitisation required?
			.then('data', function(next) {
				var replaceCount = 0;
				agent.progress('Tidying data');
				var data = traverse(this.data).map(function(node) {
					// TODO: Reimplement sanitisation or will Mongoosy handle this?
					/*
					if (monoxide.utilities.isObjectId(node)) {
						replaceCount++;
						this.update(node.toString(), true);
					} else if (node instanceof monoxide.mongoose.Types.Decimal128) {
						this.update(node.toString(), true);
					} else 
					/
					if (_.isDate(node)) {
						//this.update(node.toISOString(), true);
						replaceCount++;
						return node.toISOString();
					} else {
						return node;
					}
				});
				console.log('data', data);
				
				//agent.progress(`Replaced ${replaceCount} fields with string equivalents`);
				next(null, this.data);
			})
			*/
			.then(function(next) {
				fs.mkdir(
					`${app.config.paths.data}/reports/${settings.file}`,
					{recursive: true},
					err => {
						if (err) return next(err);
						agent.progress(`Saving history at ${app.config.paths.data}/reports/${settings.file}/${(new Date).toISOString()}.json`);
						fs.writeFile(
							`${app.config.paths.data}/reports/${settings.file}/${(new Date).toISOString()}.json`,
							JSON.stringify(this.data, null, '\t'),
							next
						);
					});
			})
			/// }}}
			// End {{{
			.end('data', done);
			// }}}
	},
};
