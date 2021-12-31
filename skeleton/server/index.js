#!/usr/bin/env node

/**
* App server bootstrapper and initialiser
*
* This file will configure, setup, and start the application server, pulling in
* all the required modules, controllers, services, etc. the app will need to run.
*/

var crash = require('@momsfriendlydevco/crash');
var debug = require('debug')('doop');
var globby = require('globby');

Promise.resolve()
	// Load app core {{{
	.then(()=> {
		debug('load app core')
		require('../app/app.backend');
	})
	// }}}
	// Initialize all .doop files {{{
	.then(()=> debug('app.setup()'))
	.then(()=> app.setup())
	// }}}
	// Load third party components (glob: ['node_modules/@doop/**/doop.backend.hooks.js']) {{{
	.then(()=> debug('Load 3rd party ./n*_m*/**/@doop/doop.backend.hooks.js files'))
	.then(()=> globby([
			`${app.config.paths.root}/node_modules/@doop/**/doop.backend.hooks.js`,
			`!${app.config.paths.root}/node_modules/**/node_modules`,
		])
		.then(modPaths => modPaths.forEach(modPath => {
			debug('Load module', modPath);
			require(modPath)
		}))
	)
	// }}}
	// Emit events to boot server in order {{{
	.then(()=> debug('Begin emitter chain'))
	.then(()=> app.emit('preInit'))
	.then(()=> app.emit('init'))
	.then(()=> app.emit('postInit'))
	.then(()=> app.emit('preMiddleware'))
	.then(()=> app.emit('middleware'))
	.then(()=> app.emit('postMiddleware'))
	.then(()=> app.emit('preSchemas'))
	.then(()=> app.emit('schemas'))
	.then(()=> app.emit('postSchemas'))
	.then(()=> app.emit('preAgents'))
	.then(()=> app.emit('agents'))
	.then(()=> app.emit('postAgents'))
	.then(()=> app.emit('preEndpoints')) // Also emits migrations
	.then(()=> app.emit('endpoints'))
	.then(()=> app.emit('postEndpoints'))
	.then(()=> app.emit('preServer'))
	.then(()=> app.emit('server')) // Also emits preExpress + postExpress when express loads
	.then(()=> app.emit('postServer'))
	.then(()=> app.emit('preReady'))
	.then(()=> app.log(app.log.colors.bold.blue('⚝  Doop! ⚝')))
	.then(()=> app.emit('ready'))
	.then(()=> debug('Finished bootstrap'))
	// }}}
	// Error handling {{{
	.catch(e => crash.stop(e, {prefix: 'Fatal server process exit'}))
	// }}}
