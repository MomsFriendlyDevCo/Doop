/**
* WARNING
* This unit is only a proof of concept and has not yet been tested in the wild
* Remove this note when its verified as working
*
* @date 2017-02-19
* @author Matt Carter <m@ttcarter.com>
*/

/**
* Doop unit to setup an SSL listener
* If this module is not disabled (by setting app.config.ssl.enabled=false) it will raise an error with instructions on how to init the certificate command
*
* Install:
* 1. Install letsencrypt `sudo apt-get install letsencrypt`
* 2. Setup the certificate - `sudo letsencrypt certonly --webroot -w ./units/ssl/cert -d <DOMAIN>`
*
*/

var async = require('async-chainable');
var colors = require('chalk');
var fs = require('fs');
var https = require('https');
var url = require('url');

app.register('postServer', function(finish) {
	if (!app.config.ssl.enabled) return finish();

	async()
		// Read in the certs {{{
		.parallel({
			cert: function(next) {
				var path = __dirname + '/cert/fullchain.pem';
				fs.readFile(path, function(err, content) {
					if (err) return next('No SSL certificate (' + path + ')');
					next(null, content);
				})
			},
			key: function(next) {
				var path = __dirname + '/cert/privkey.pem';
				fs.readFile(path, function(err, content) {
					if (err) return next('No SSL certificate key file (' + path + ')');
					next(null, content);
				})
			},
		})
		// }}}
		// Setup HTTPS server {{{
		.then(function(next) {
			https.createServer({
				cert: this.cert,
				key: this.key,
			}, app).listen(app.config.ssl.port);
		})
		// }}}
		// End {{{
		.end(function(err) {
			if (err) {
				var parsedUrl = url.parse(app.config.publicUrl);
				console.log(colors.red('- SSL ERR'), err.toString());
				console.log('   - Disable SSL mode by setting', colors.cyan('app.config.ssl.enabled=false'), 'OR');
				console.log('   - Install a cert via the command:', colors.cyan('sudo letsencrypt certonly --webroot -w ./units/ssl/cert -d ' + parsedUrl.hostname));
			}

			finish();
		});
		// }}}
});
