/**
* Doop async initalizer
* This module taks a basic app object and loads in all files / async / event handlers
* @returns {Promise} A promise which will resolve with the fully loaded Doop stack
*/

var _ = require('lodash');
var debug = require('debug')('doop');
var eventer = require('@momsfriendlydevco/eventer');
var fspath = require('path');
var glob = require('globby');
var importSCF = require('gulp-block-head').import;
var fspath = require('path');
var vm = require('vm');

// Transform worker {{{
var transform = (content, path, block) => {
	if (!block.attr.on) block.attr.on = 'paths';

	var id = block.attr.id || fspath.dirname(fspath.relative(app.config.paths.root, path)); // Use path portion relative to root directory
	var rawModules = _(block.attr.raw || '') // Extract raw module list as a lookup object
		.split(/\s*,\s*/)
		.mapKeys()
		.mapValues(v => true)
		.value();

	var sandbox = vm.createContext({
		app, global, module, process, // Import the standard modules
		Array, Buffer, Promise, RegExp, // Import standard classes
		id, // Glue the module ID onto the base structure
		db: app.db,
		console: new Proxy(console, {
			get: (obj, prop) => // Wrapper to fetch either app.logger.METHOD or fallback to console.METHOD
				_.isFunction(app.logger[prop])
					? app.logger[prop].bind(sandbox.app, sandbox.app.log.colors.blue(`[${id}]`))
					: app.logger[prop]
		}),
		setTimeout, clearTimeout, setInterval, clearInterval,
		require: require('module').createRequire(path), // Make require work as a relative path
	});

	var isExporter = /^\s*(module\.)?exports\s*=/m.test(content); // Module exports something

	// Horrible kludges
	content = content
		.replace(/\bapp\.log\(/g, 'console.log(') // rewrite app.log -> console.log so we can contexify where the message came from
		.replace(/\bexports\s*=/, 'module.exports = ') // exports = -> module.exports as Node doesn't like us addressing sandbox contexts directly

	app.log.debug('Compile', path, '+' + block.lineOffset);
	var compiledFunction = vm.compileFunction(content, ['app', 'console', 'module', 'require'], { // Horrible kludge to correctly export `require`
		filename: path,
		lineOffset: block.lineOffset,
		parsingContext: sandbox,
	}).bind(sandbox.app, sandbox.app, sandbox.console, sandbox.module, sandbox.require);

	var blockEvents = // Determine which event to bind this output to
		block.id == 'endpoint' ? 'endpoints' // Treat <endpoint/> ~= on="endpoints"
		: block.id == 'schema' ? 'schemas' // Treat <schema/> ~= on="schemas"
		: block.attr.on ? block.attr.on.split(/\s*,\s*/) // Use the block.attr.on CSV
		: block.id; // Use the block name if its not server, otherwise use the contents of "on"

	if (isExporter) { // Handle exported values
		app.on(blockEvents, (...args) => {
			app.log.debug('Fire intermediate hook for event', blockEvents.length > 1 ? blockEvents : blockEvents[0], 'on ID', id);
			var result = compiledFunction();

			if (sandbox.module.exports && _.isFunction(sandbox.module.exports)) { // Register as event handler based on exported function
				return sandbox.module.exports.apply(app, args);
			} else if (_.isEmpty(sandbox.module.exports)) { // Didn't mutate the exporter - run as code
				throw new Error(`Script ${id} ("${path}") returned a non-function as an export`);
			} else if (result) {
				throw new Error(`Script ${id} ("${path}") returned a value "${typeof result}" rather than decorating module.exports`);
			}
		}, {source: `${path} +${block.lineOffset} (export)`});
	} else { // Assume module published code inline
		app.on(blockEvents, compiledFunction, {source: `${path} +${block.lineOffset} (inline code block)`}); // Bind to handler and let it return its own payload
	}
};
// }}}

module.exports = ()=>
	Promise.resolve()
		// Extend app object with event handler structure {{{
		.then(()=> {
			if (_.isFunction(app.emit)) throw new Error('App has already been setup!');
			eventer.extend(app);
		})
		// }}}
		// Slurp .doop files + process {{{
		.then(()=> debug('Process Doop files'))
		.then(()=> glob([
			`**/*.doop`,
			...app.config.paths.ignore,
		]))
		.then(files => importSCF(files, {
			blocks: {
				endpoint: {transform},
				server: {transform},
				schema: {transform},
			},
			sandbox: false,
		}))
		// }}}
		// Glue debugging onto app.emit / app.on if debugging is enabled {{{
		.then(()=> {
			if (!debug.enabled) return;
			app.log.debug('Adding debugging to emitters');

			app.on('meta:preEmit', event => app.log.debug('Emit', event, 'to', app.listenerCount(event), 'subscribers'));
			app.on('meta:postEmit', event => app.log.debug('Finished emit', event, 'to', app.listenerCount(event), 'subscribers'));

			app.log.debug('Begin emitter sequence');
		})
		// }}}
		// Replace the setup function so multiple calls don't screw things up {{{
		.then(()=> app.setup = ()=> true)
		// }}}
