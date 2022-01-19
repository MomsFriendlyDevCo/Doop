/**
* Doop async initalizer
* This module takes a basic app object and loads in all files / async / event handlers
* @returns {Promise} A promise which will resolve with the fully loaded Doop stack
*/

const _ = require('lodash');
const eventer = require('@momsfriendlydevco/eventer');
const fspath = require('path');
const glob = require('globby');
const importSCF = require('gulp-block-head').import;
const vm = require('vm');

// Lookup of simple attributes which should expand to another
// e.g. `<script lang="js" backend endpoint>` => `<script lang="js" backend on="endpoints">`
const blockAliases = {
	endpoint: {on: 'endpoints'},
	middleware: {on: 'middleware'},
	schema: {on: 'schemas'},
};

/**
 * Imports SFC and 3rd party Doop files.
 *
 * @param {object} [options] Configuration object
 * @param {boolean} [options.local = true] Import local project files
 * @param {boolean} [options.vendor = true] Import 3rd party files
 *
 * @example Load a Doop stack
 * require('./app.backend');
 * return app.setup({
 *   local: true,
 *   vendor: false,
 * })
*/
module.exports = (options = {}) => {
	if (_.isFunction(app.emit)) throw new Error('App has already been setup!');

	_.defaults(options, {
		local: true,
		vendor: true,
	});

	const parseFiles = files => importSCF(files, {
		blocks: {
			// <script lang="js"> SFC {{{
			script: {
				transform: (content, path, block) => {
					const pathRelative = fspath.relative(app.config.paths.root, path);

					// Sanity checks {{{
					if (!block.attr.frontend && !block.attr.backend) { // No specifier - warn
						app.log.warn.as('Doop Compile', app.log.colors.cyan('<script>'), 'tag in', app.log.colors.cyan(pathRelative), 'is ambiguous. Specify', app.log.colors.cyan('<script lang="js" frontend>'), 'or', app.log.colors.cyan('<script lang="js" backend>'), 'attribute tags');
						return '';
					} else if (block.attr.frontend && block.attr.backend) { // Has both - warn
						app.log.warn.as('Doop Compile', app.log.colors.cyan('<script>'), 'tag in', app.log.colors.cyan(pathRelative), 'has both `frontend` + `backend` tags. Specify', app.log.colors.cyan('<script lang="js" frontend>'), 'or', app.log.colors.cyan('<script lang="js" backend>'), 'attribute tags');
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
					const id = block.attr.id || fspath.dirname(pathRelative); // Use path portion relative to root directory
					// }}}

					// Create a sandbox for the extracted block {{{
					const sandbox = vm.createContext({
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

					// Code rewrites {{{
					content = content
						.replace(/\bapp\.log\(/g, 'console.log(') // rewrite app.log -> console.log so we can contexify where the message came from
						.replace(/\b(module\.)?exports\s*=/, 'return ') // (module.)exports = -> return as Node doesn't like us addressing sandbox contexts directly
					// }}}

					// Compile sandbox {{{
					app.log.debug('Compile', pathRelative, '+' + block.lineOffset);
					const compiledFunction = vm.compileFunction(content, ['app', 'console', 'module', 'require'], { // Horrible kludge to correctly export `require`
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
					const pathRelative = fspath.relative(app.config.paths.root, path);
					app.log.warn.as('Doop Compile', 'Unknown block', app.log.colors.cyan(`<${block.tag}/>`), 'in file', app.log.colors.cyan(pathRelative));
					return '';
				},
			},
			// }}}
		},
		sandbox: false,
	});

	return Promise.resolve()
		// Extend app object with event handler structure {{{
		.then(()=> {
			eventer.extend(app);
		})
		// }}}
		// Slurp .doop files + process {{{
		//.then(()=> app.log.debug('Process Doop files'))

		// Local
		.then(()=> options.local && glob([
			`**/*.doop`,
			!app.config.isProduction && '**/*.vue', // Process .vue files in non-production only (syntax checks block headers)
			...app.config.paths.ignore,
		].filter(Boolean), {
			gitignore: true, // Respect .gitignore file (usually excludes node_modules, data, test etc.)
		}))
		.then(files => files && files.length > 0 && parseFiles(files)
			//.then(() => app.log.as('backend', files))
			.then(() => app.log.as('backend', 'Imported', files.length, 'local .doop files'))
		)

		// 3rd Party
		.then(()=> options.vendor && glob([
			`./node_modules/@doop/**/*.doop`,
			// TODO: Do we need *.vue from node_modules?
			//!app.config.isProduction && './node_modules/@doop/**/*.vue', // Process .vue files in non-production only (syntax checks block headers)
		].filter(Boolean), {
			gitignore: false,
		}))
		.then(files => files && files.length > 0 && parseFiles(files)
			//.then(() => app.log.as('backend', files))
			.then(() => app.log.as('backend', 'Imported', files.length, '3rd party .doop files'))
		)

		// }}}

		// Execute any 3rd party backend hooks {{{
		.then(()=> options.vendor && glob([
			`${app.config.paths.root}/node_modules/@doop/**/doop.backend.hooks.js`,
			`!${app.config.paths.root}/node_modules/**/node_modules`,
		])
		.then(files => {
			files.forEach(modPath => {
				app.log.debug('Load module', modPath);
				require(modPath);
			});
			app.log.as('backend', 'Imported', files.length, '3rd party hook files')
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
