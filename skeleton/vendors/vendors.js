module.exports = {
	// Vendor files
	// This list supports brace expansion so 'foo.{css,js}' ~> ['foo.css', 'foo.js']
	// Do not include minified files here! Minification happens automatically
	core: [
		// Core vendor dependencies - these should be as minimal as possible
		// Injected as a <script/> at the start of the <head/>
		'node_modules/@momsfriendlydevco/loader/dist/loader.{js,css}',
		'services/loader/loader.css',
	],
	main: [
		// Main vendor dependencies - these include pretty much everything else below-the-fold
		// Injected as a <script defer/> at the end of the <head/>
		// Dependencies maintain order so list pre-requisites first

		// --- 1. CRITICAL dependency parent packages below this line, keep as sparce as possible (include the dep in comments) --- //
		'node_modules/jquery/dist/jquery.js', // Needed by most core functions, FIXME: Really?
		'node_modules/popper.js/dist/umd/popper.js', // Needed by Bootstrap

		// --- 2. DEPENDENT packages below this line --- //
		//'node_modules/bootstrap/dist/css/bootstrap.css', // Using customised version from Minton
		'node_modules/bootstrap/dist/js/bootstrap.js',
		'node_modules/vue/dist/vue.js',

		// --- 3. MINOR vendors or vendors that don't have any dependents below this line (alphabetical) --- //
		'node_modules/axios/dist/axios.js',
		'node_modules/lodash/lodash.js',
		'node_modules/moment/moment.js',
		'node_modules/vue-router/dist/vue-router.js',
		'node_modules/vue-snotify/vue-snotify.js',
		'node_modules/vue-snotify/styles/material.css',
		'node_modules/tree-tools/dist/tree-tools.js',
	],
};
