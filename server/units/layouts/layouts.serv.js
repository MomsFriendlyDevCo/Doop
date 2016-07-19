var ejs = require('ejs');
var layouts = require('express-ejs-layouts');

app.register('init', function(finish) {
	app.set('title', app.config.title);
	app.set('views', app.config.paths.server);
	app.set('view engine', 'html');
	app.set('layout', 'units/layouts/main');
	app.engine('.html', ejs.renderFile);
	app.enable('view cache');
	app.use(layouts);

	finish();
});
