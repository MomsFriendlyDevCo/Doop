/**
* WARNING
* This unit is only a proof of concept and has not yet had adequate testing in the wild
* Remove this note when its verified as working
*
* @date 2017-03-29
* @author Matt Carter <m@ttcarter.com>, Jake Skoric <jake@mfdc.biz>
*/

/**
* Doop unit to setup an SSL listener
* If this module is not disabled (by setting app.config.ssl.enabled=false) it will raise an error with instructions on how to init the certificate command
*
* Required Files:
* 1. SSL Certificate file in `units/ssl/cert/fullchain.pem`
* 2. Private key file in `units/ssl/cert/privkey.pem`
*
* As the above files are generally unique to the server, they should NOT be comitted to the VCS (Git)
* 
* Install:
* 1. Install letsencrypt `sudo apt-get install letsencrypt`
* 2. Setup the certificate - `sudo letsencrypt certonly --webroot -w ./units/ssl/cert -d <DOMAIN>`
*
*/

var async = require('async-chainable');
var colors = require('chalk');
var express = require('express');
var fs = require('fs');
var http = require('http');
var https = require('https');
var url = require('url');

app.register('preHTTPServer', function(finish) {
	// If SSL enabled, create basic server to redirect to HTTPS server
	if (app.config.ssl.enabled) {
		var redirectApp = express();
		redirectApp.get('/*', function(req, res) {
			res.redirect('https://' + url.parse(app.config.url).hostname + req.url); // Force HTTPS protocol, irrespective of specified protocol in app.config.url
		});
		http.createServer(redirectApp).listen(80); // Force port 80 as app.config.port should be app server port

		return finish('SSL set as enabled');
	}

	finish();
});

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
				return finish('HTTPS SERVER NOT BOOTED: ' + err.toString());
			}

			finish();
		});
		// }}}
});
