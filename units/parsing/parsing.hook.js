var bodyParser = require('body-parser');
var cookieParser = require('cookie-parser');
var compression = require('compression');

app.register('init', function(finish) {
	app.use(cookieParser());
	app.use(bodyParser.json({limit: '16mb'}));
	app.use(bodyParser.urlencoded({limit: '16mb', extended: false}));
	app.use(compression());

	finish();
});
