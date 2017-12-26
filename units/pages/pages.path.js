/**
* Pages controller
* Request handling for general app pages
*/
app.get('/', function(req, res) {
	// Inject fancy new HTML/2 header to pre-fetch scripts we are going to be using anyway {{{
	res.set('Link', [
		'/build/vendors-core.min.css',
		'/build/vendors-core.min.js',
		'/build/vendors-main.min.js',
		'/build/vendors-main.min.css',
		'/build/app.min.js',
		'/build/app.min.css',
		'/build/partials.min.js',
	]
		.map(f => `<${f}>; rel=preload; as=${f.endsWith('css') ? 'style' : 'script'}`)
		.join(', '));
	// }}}

	res.render('units/pages/main', {
		theme: app.config.theme,
	});
});
