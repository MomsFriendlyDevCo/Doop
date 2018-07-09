/**
* Data indexer
* This unit loads all *.indexer.js files into the app.cache facility periodically
* It is a cross between a cron job and a caching module
* For example to load all widgets every 3 hours there should be a widgets.indexer.js file which exports a callback which will get paged every 3 hours with a value, this is cached and can be returned via get()
*
* @example In the widgets.indexer.js file
* module.exports = {
*   id: 'widgets',
*   timing: '0 * * * *', // Every hour
*   worker: (finish) => { complexOperation(finish) }
* };
* @example Somewhere else in the application
* app.indexer.get('widgets', (err, value) => { ... });
*/

var _ = require('lodash').mixin(require('lodash-keyarrange'));
var async = require('async-chainable');
var argy = require('argy');
var colors = require('colors');
var cronTranslate = require('cronstrue').toString;
var CronJob = require('cron').CronJob;
var fspath = require('path');
var humanize = require('humanize');
var glob = require('glob');
var pm2 = require('pm2');

var indexer = {};
module.exports = app.indexer = indexer;


/**
* Collection of index services
* All are loaded from **.index.js
* @var {Object <Object>} Object where all keys are the index name (stripped of the `.index.js` suffix), all values should be an object
* @param {function} worker The callback function to run when the indexer timing expires
* @param {string} [timing] A cron compatible expression on when the indexer should run. If omitted no cronJob is registered
* @param {string} id The ID of the index to store in the cache
* @param {boolean} [immediate=false] Whether to run the indexer as soon as the server is ready - should only be used for debugging purposes (only works if app.config.indexer.allowImmediate is true)
*
* @param {CronJob} [cronJob] The CronJob object calculated from the timing string. Only available if timing is specified
*/
indexer._indexers;


/**
* Tracker for individual versions of indexers + settings that are running
* @var {Object}
* @param {boolean} [isRunning] Whether the job is currently running
* @param {array <function>} [waiting] List of functions waiting for the result of the worker - register a callback into this if you want the next available result
*/
indexer._running = {};


/**
* Whether any discovered indexers should be installed as a cronjob
* @var {boolean}
*/
indexer._autoInstall = true;


/**
* Refresh all indexable services
* @param {function} finish Callback to call when done as (err, indexers)
*/
indexer.refresh = function(finish) {
	async()
		// Glob all indexers {{{
		.then('paths', next => glob(`${app.config.paths.root}/units/**/*.indexer.js`, next))
		// }}}
		// Assign all found indexers to a lookup object {{{
		.then(function(next) {
			indexer._indexers = _(this.paths)
				.mapKeys(path => {
					var module = require(path);
					if (!module.id) console.log(colors.blue('[indexer]'), `Indexer path "${path}" does not have an ID - skipped`);
					return module.id;
				})
				.mapValues(path => require(path))
				.mapValues((v, k) => _.set(v, 'context',  indexer.createContext({
					id: k,
				})))
				.pickBy((v, k) => k !== 'undefined') // Only include indexers that have a valid ID
				.value();

			next();
		})
		// }}}
		// Output list of loaded indexers {{{
		.then(function(next) {
			console.log(colors.blue('[indexer]'), 'Loaded indexers', _.keys(indexer._indexers).sort().map(i => colors.cyan(i)).join(', '));
			next();
		})
		// }}}
		// End {{{
		.end(function(err) {
			if (err) return finish(err);
			finish(null, indexer._indexers);
		})
		// }}}
};


/**
* Check whether then given index ID is valid
* @param {string} id The index ID to check
* @returns {boolean} Whether the index is valid
*/
indexer.has = id => !! indexer._indexers[id];


/**
* Setup an indexer with scheduling
*/
indexer.setup = function(finish) {
	async()
		// Load available indexers (if we havn't already) {{{
		.then('indexers', function(next) {
			if (indexer._indexers) return next(indexer._indexers);
			indexer.refresh(next);
		})
		// }}}
		// Setup all jobs {{{
		.forEach('indexers', function(next, indexWorker, id) {
			if (!indexWorker.timing || !indexer._autoInstall) return next(); // No timing - don't bother registering

			indexWorker.cronJob = new CronJob({
				cronTime: indexWorker.timing,
				onTick: ()=> {
					console.log(colors.blue('[indexer]'), 'Refreshing index worker', colors.cyan(id), 'from cron timing', colors.cyan(indexWorker.timing), colors.grey(`(${cronTranslate(indexWorker.timing)})`));
					indexer.run(id);
				},
				start: true, // Means start the item in the cron queue, not actually run the tick
			});

			console.log(colors.blue('[indexer]'), 'Installed index worker', colors.cyan(id), 'with timing', colors.cyan(indexWorker.timing), colors.grey(`(${cronTranslate(indexWorker.timing)})`));
			next();
		})
		// }}}
		// Run all indexers marked as immediate {{{
		.forEach('indexers', function(next, indexWorker, id) {
			if (!indexWorker.immediate || !app.config.indexer.allowImmediate) return next();
			console.log(colors.blue('[indexer]'), 'Index worker', colors.cyan(id), 'marked for immediate run!');
			indexer.run(id, next);
		})
		// }}}
		.end(finish);
};


/**
* Convenience function to retrieve an item thats been indexed OR run the indexer and get that result
* This function really just checks if a cache exists, if so it uses that, if not the worker is run then the result is cached + used
* @param {string} id The ID of the worker result to return
* @param {Object} [settings] Optional settings to pass to the indexer
* @param {function} finish Callback to call as (err, result)
*/
indexer.get = argy('string [object] [function]', function(id, settings, finish) {
	async()
		// Try to access an existing cache value {{{
		.then('value', function(next) {
			if (!app.config.indexer.enabled) {
				console.log(colors.blue('[indexer]'), 'Indexer is disabled, forcing fresh value calculation each time!');
				return next();
			} else {
				app.middleware.cache.get(id, next);
			}
		})
		// }}}
		// No cache value - run the worker {{{
		.then('value', function(next) {
			if (this.value !== undefined) return next(null, this.value);
			indexer.run(id, settings, next);
		})
		// }}}
		// End {{{
		.end(function(err) {
			if (err) return finish(err);
			finish(null, this.value);
		})
		// }}}
});


/**
* Compute a unique hashed key from a combination of the ID and settings object
* @param {string} id The ID of the worker
* @param {Object} [settings] Optional settings structure
*/
indexer.getKey = function(id, settings) {
	var hashable = _(settings)
		.keyArrangeDeep()
		.omit(['cacheKey', 'enclose'])
		.value()

	return _.isEmpty(hashable)
		? id
		: id + '-' + app.middleware.cache.hash(hashable)
};


/**
* Create a worker context for the specified indexer
* The context gets attached to indexer._indexers[id].context when refresh() is called
* @param {Object} settings Settings object used to create the worker
* @param {string} settings.id The ID of the worker
* @return {Object} A context object used to call the indexers .worker() function
*/
indexer.createContext = (settings) => {
	return {
		colors: colors,
		log: (...msg) => console.log.apply(this, [colors.blue(`[indexer / ${settings.id}]`)].concat(msg)),
	};
};


/**
* Run the worker
* Generally you will want to use the lazier get() function rather than this
* NOTE: This will also cache the result
* @param {string} id The ID of the worker result to return
* @param {Object} [settings] Optional settings to pass to the indexer
* @param {boolean} [settings.enclose=false] Never throw an error, instead enclose it as a return value of the form `{error: String}`
* @param {string} [settings.cacheKey] Key to use (instead of id) when storing the result
* @param {function} finish Callback to call as (err, result)
*/
indexer.run = argy('string [object] [function]', function(id, settings, finish) {
	// Compute the cache key to use when communicating (if settings exists) {{{
	var cacheKey = indexer.getKey(id, settings);
	if (!settings) settings = {};
	if (settings.cacheKey != cacheKey) {
		settings.cacheKey = cacheKey;
		console.log(colors.blue('[indexer]'), 'Using cacheKey', colors.cyan(cacheKey));
	}
	// }}}

	// If the indexer is already running - queue the callback for when the worker completes {{{
	if (_.get(indexer, ['_running', cacheKey, 'isRunning'])) { // Is there already a worker running? If so register as waiting and exit
		if (_.isFunction(finish)) {
			console.log(colors.blue('[indexer]'), 'Request to run already executing worker', colors.cyan(id), 'queued', colors.grey(`(as cacheKey "${cacheKey}")`));
			if (!indexer._running[cacheKey].waiting) indexer._running[cacheKey].waiting = [];
			 indexer._running[cacheKey].waiting.push(finish);
		} else {
			console.log(colors.blue('[indexer]'), 'Request to run already executing worker', colors.cyan(id), 'no callback was passed so this request is ignored');
		}
		return;
	} else {
		indexer._running[cacheKey] = {isRunning: true};
	}
	// }}}

	async()
		.set('startTime', Date.now())
		.then('value', function(next) {
			switch (app.config.indexer.method) {
				// Inline task runner {{{
				case 'inline':
					console.log(colors.blue('[indexer]'), 'Running indexer worker', colors.cyan(id), '(inline)...');
					indexer._indexers[id].worker.call(indexer._indexers[id].context, (err, value) => {
						if (err && settings.enclose) {
							console.log(colors.blue('[indexer]'), 'Caught error, enclosing');
							value = {error: err.toString()};
							err = undefined;
						} else if (err) {
							return next(err);
						}
						if (app.config.indexer.enabled) app.middleware.cache.set(settings.cacheKey || id, value);
						next(null, value);
					}, settings || {});
					break;
				// }}}

				// PM2 delegated task runner {{{
				case 'pm2':
					async()
						.set('procName', `indexer-${app.config.name}-${id}`)
						// Connect to PM2 {{{
						.then('pm2', function(next) {
							pm2.connect(next);
						})
						// }}}
						// Check if the process is already registered {{{
						.then(function(next) {
							pm2.describe(this.procName, (err, proc) => {
								if (err || !proc || !proc.length || _.isEqual(proc, [[]]) || _.isEqual(proc, [])) return next(); // Process doesn't exist - continue on
								var status = _.get(proc, '0.pm2_env.status');
								console.log(colors.blue('[indexer]'), 'Process', colors.cyan(this.procName), 'already exists and has the status', colors.cyan(status), 'terminating...');
								pm2.delete(this.procName, ()=> next());
							});
						})
						// }}}
						// Create the process {{{
						.then('pid', function(next) {
							console.log(colors.blue('[indexer]'), 'Spawning PM2 process', colors.cyan(this.procName));
							pm2.start(`${app.config.paths.root}/run-indexer`, {
								name: this.procName,
								args: [id], // NOTE: This doesn't work due to the way that PM2 wraps the node script
								cwd: app.config.paths.root,
								env: {
									NODE_ENV: app.config.env,
									INDEXER: id,
									INDEXER_SETTINGS: JSON.stringify(settings),
								},
								autorestart: false,
								interpreter: 'node',
								interpreterArgs: ['--max-old-space-size=12288'],
							}, (err, proc) => {
								if (err) return next(err);
								next(null, proc[0].pid);
							});
						})
						// }}}
						// Poll the process until it finishes {{{
						.then(function(next) {
							var checkAttempts = 0;
							var checkProcess = ()=> {
								pm2.describe(this.procName, (err, proc) => {
									if (err) return next(err);
									var status =
										_.isEqual(proc, [[]]) && _.isEqual(proc, []) ? 'launching'
										: _.has(proc, '0.pm2_env.status') ? proc[0]['pm2_env'].status
										: 'unknown';

									// console.log('PM2 PROC', this.procName, 'HAS STATUS', status);
									switch (status) {
										case 'launching':
										case 'stopping':
										case 'online': // Still running - wait and try again
											if ((++checkAttempts % 10) == 0) console.log(colors.blue('[indexer]'), 'Waiting for PM2 process', colors.cyan(this.procName), 'to complete. Attempt', colors.cyan(checkAttempts));
											setTimeout(checkProcess, 500);
											break;
										case 'stopped':
											next();
											break;
										case 'errored':
											next('PM2 process errored out');
											break;
										case 'unknown':
											console.log(`Error: When asked to describe proc "${this.procName}", PM2 gave back:`);
											console.log(require('util').inspect(proc, {depth: null, colors: true}))
											next('Unknown PM2 process status');
											break;
										default:
											next(`Unknown PM2 status: ${status}`);
									}
								});
							};
							checkProcess();
						})
						// }}}
						.parallel({
							// Scoop the computed value from the cache {{{
							value: function(next) {
								app.middleware.cache.get(settings.cacheKey || id, next);
							},
							// }}}
							// Clean up the PM2 process {{{
							pm2Cleaner: function(next) {
								pm2.delete(this.procName, ()=> next());
							},
							// }}}
						})
						// Disconnect and continue into outer handler {{{
						.end(function(err) {
							if (this.pm2) pm2.disconnect();

							if (err) {
								console.log(colors.blue('[indexer]'), 'PM2 process creation error', err);
								next(err);
							} else if (_.isObject(this.value) && _.keys(this.value).length == 1 && this.value.error) { // Is the sub-process returning an error object instead?
								// NOTE: We have to work around this as sub-process indexers can only return a value not an error object
								next(this.value.error);
							} else {
								next(null, this.value);
							}
						})
						// }}}

					break;
				// }}}

				// Unknown task runner {{{
				default:
					throw new Error(`Unknown task index method: "${app.config.indexer.method}"`);
				// }}}
			}
		})
		.end(function(err) {
			// Show status on the console {{{
			if (err) {
				console.log(colors.blue('[indexer]'), colors.red('ERROR'), 'Indexer worker', colors.cyan(id), 'threw:', err);
				this.value = null;
			} else if (this.value === false) { // Trap `false` as a special 'I dont want to save anything' result
				console.log(colors.blue('[indexer]'), 'Indexer worker', colors.cyan(id), 'finished in', colors.cyan(Date.now() - this.startTime + 'ms'), colors.grey('(indexer has no cachable payload)'));
			} else {
				console.log(colors.blue('[indexer]'), 'Indexer worker', colors.cyan(id), 'finished in', colors.cyan(Date.now() - this.startTime + 'ms'), 'with an object size of', colors.cyan(humanize.filesize(JSON.stringify(this.value || '').length)));
				if (!this.value) err = `Index Worker ${id} returned an empty value!`;
			}
			// }}}

			// Fire callbacks for all callbacks registered against this indexer {{{
			var peerCallbacks = indexer._running[cacheKey].waiting || [];
			delete indexer._running[cacheKey];

			if (err) {
				// Call this callback if its interested in the result
				if (_.isFunction(finish)) finish(err);

				// Call any other callbacks that are interested in the result
				peerCallbacks.forEach(cb => cb(err));
			} else {
				// Call this callback if its interested in the result
				if (_.isFunction(finish)) finish(null, this.value);

				// Call any other callbacks that are interested in the result
				peerCallbacks.forEach(cb => cb(null, this.value));
			}
			// }}}
		});
});
