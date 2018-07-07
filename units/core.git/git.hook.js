/**
* Loads and provides the current git release in app.git
*
* @example Access the current git shortHash
* var hash = app.git.shortHash
*/

var git = require('./git');

app.register('init', function(finish) {
	git.current((err, gitInfo) => {
		if (err) return finish(err);
		app.git = gitInfo;
		finish();
	});
});
