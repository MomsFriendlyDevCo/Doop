module.exports = {
	// Vendor files
	// This list supports brace expansion so 'foo.{css,js}' ~> ['foo.css', 'foo.js']
	// Do not include minified files here! Minification happens automatically
	core: [
		// Core vendor dependencies - these should be as minimal as possible
		// Injected as a <script lang="js"/> at the start of the <head/>
		'node_modules/@momsfriendlydevco/loader/dist/loader.{js,css}',
	],
	main: [
		// Main vendor dependencies - these include pretty much everything else below-the-fold
		// Injected as a <script lang="js" defer/> at the end of the <head/>
		// Dependencies maintain order so list pre-requisites first

		// --- 1. CRITICAL dependency parent packages below this line, keep as sparce as possible (include the dep in comments) --- //
		'node_modules/jquery/dist/jquery.js', // Needed by most core functions, FIXME: Really? Bootstrap 5 no longer requires
		'node_modules/@popperjs/core/dist/umd/popper.js', // Needed by Bootstrap

		// --- 2. DEPENDENT packages below this line --- //
		'node_modules/bootstrap/dist/css/bootstrap.css',
		'node_modules/bootstrap/dist/js/bootstrap.js',

		// --- 3. MINOR vendors or vendors that don't have any dependents below this line (alphabetical) --- //
		'node_modules/moment/moment.js',
		'node_modules/tree-tools/dist/tree-tools.js',
	],
};
