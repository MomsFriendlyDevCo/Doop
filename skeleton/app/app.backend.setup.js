/**
* Doop async initalizer
* This module takes a basic app object and loads in all files / async / event handlers
* @returns {Promise} A promise which will resolve with the fully loaded Doop stack
*/

var _ = require('lodash');
var eventer = require('@momsfriendlydevco/eventer');
var fspath = require('path');
var glob = require('globby');
var importSCF = require('gulp-block-head').import;
var vm = require('vm');

// Lookup of simple attributes which should expand to another
// e.g. `<script lang="js" backend endpoint>` => `<script lang="js" backend on="endpoints">`
var blockAliases = {
	endpoint: {on: 'endpoints'},
	middleware: {on: 'middleware'},
	schema: {on: 'schemas'},
};


module.exports = ()=> {
	if (_.isFunction(app.emit)) throw new Error('App has already been setup!');

	return Promise.resolve()
		// Extend app object with event handler structure {{{
		.then(()=> {
			eventer.extend(app);
		})
		// }}}
		// Slurp .doop files + process {{{
		.then(()=> app.log.debug('Process Doop files'))
		.then(()=> glob([
			`**/*.doop`,
			!app.config.isProduction && '**/*.vue', // Process .vue files in non-production only (syntax checks block headers)
			...app.config.paths.ignore,
		].filter(Boolean)))
		.then(files => importSCF(files, {
			blocks: {
				// <script lang="js"> SFC {{{
				script: {
					transform: (content, path, block) => {
						var pathRelative = fspath.relative(app.config.paths.root, path);

						// Sanity checks {{{
						if (!block.attr.frontend && !block.attr.backend) { // No specifier - warn
							app.log.warn.as('Doop Compile', app.log.colors.cyan('<script>'), 'tag in', app.log.colors.cyan(pathRelative), 'is ambiguous. Specify', app.log.colors.cyan('<script lang="js" frontend>'), 'or', app.log.colors.cyan('<script lang="js" backend>'), 'attribute tags');
							return '';
						} else if (!block.attr.backend) { // Script is frontend - bypass as we're only loading the backend
							return '';
						}
						// }}}

						// Expand blockAliases {{{
						Object.keys(blockAliases).forEach(alias => {
							if (block.attr[alias] === true) {
								Object.assign(block.attr, blockAliases[alias]); // Explode alias
								delete block.attr[alias]; // Remove original alias from attr chain
							}
						});
						// }}}

						// Post alias expansion sanity checks {{{
						if (!block.attr.on) {
							app.log.warn.as('Doop Compile', '<script backend/> tag in', app.log.colors.cyan(pathRelative), 'has no event allocated, set', app.log.colors.cyan('<script lang="js" backend on="$EVENT">'), 'or use an alias like', app.log.colors.cyan('<script lang="js" backend endpoint>'));
							return '';
						}
						// }}}

						// Calcuate unique ID (either the file path or the ID attribute) {{{
						var id = block.attr.id || fspath.dirname(pathRelative); // Use path portion relative to root directory
						// }}}

						// Create a sandbox for the extracted block {{{
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
						// }}}

						var isExporter = /^\s*(module\.)?exports\s*=/m.test(content); // Module exports something

						// Code rewrites {{{
						content = content
							.replace(/\bapp\.log\(/g, 'console.log(') // rewrite app.log -> console.log so we can contexify where the message came from
							.replace(/\bexports\s*=/, 'module.exports = ') // exports = -> module.exports as Node doesn't like us addressing sandbox contexts directly
						// }}}

						// Compile sandbox {{{
						app.log.debug('Compile', pathRelative, '+' + block.lineOffset);
						var compiledFunction = vm.compileFunction(content, ['app', 'console', 'module', 'require'], { // Horrible kludge to correctly export `require`
							filename: path,
							lineOffset: block.lineOffset,
							parsingContext: sandbox,
						}).bind(sandbox.app, sandbox.app, sandbox.console, sandbox.module, sandbox.require);
						// }}}

						// Attach emitter response to app.on() hook {{{
						app.on(block.attr.on.split(/\s*,\s*/), compiledFunction);
						// }}}
					},
				},
				// }}}
				// <template> (ignored in Doop pre-process compile) {{{
				template: {
					transform: (content, path, block) => '',
				},
				// }}}
				// <style> (ignored in Doop pre-process compile) {{{
				style: {
					transform: (content, path, block) => '',
				},
				// }}}
				// UNKNOWN blocks {{{
				unknown: {
					matchStart: new RegExp(`^<(?<tag>.+)(?<attrs>\s*.+?\s*)?>$`),
					matchEnd: new RegExp(`^</.+>$`),
					transform: (content, path, block) => {
						var pathRelative = fspath.relative(app.config.paths.root, path);
						app.log.warn.as('Doop Compile', 'Unknown block', app.log.colors.cyan(`<${block.tag}/>`), 'in file', app.log.colors.cyan(pathRelative));
						return '';
					},
				},
				// }}}
			},
			sandbox: false,
		}))
		// }}}
		// Glue debugging onto app.emit / app.on if debugging is enabled {{{
		.then(()=> {
			if (!app.log.debug.enabled) return;
			app.log.debug('Adding debugging to emitters');

			app.on('meta:preEmit', event => app.log.debug('Emit', event, 'to', app.listenerCount(event), 'subscribers'));
			app.on('meta:postEmit', event => app.log.debug('Finished emit', event, 'to', app.listenerCount(event), 'subscribers'));

			app.log.debug('Begin emitter sequence');
		})
		// }}}
};
