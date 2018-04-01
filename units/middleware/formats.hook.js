/**
* Doop hook for express-middleware-formatter
* NOTE: This really just maps that factory function for the moment but it should probably inherit some app-wide config eventually
*/

var emf = require('@momsfriendlydevco/express-middleware-formatter');

app.register('preControllers', function(finish) {

	app.middleware.formats = emf;

	finish();
});
