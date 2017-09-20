/**
* DOOP SSL Unit
* Follow the instructions in README.md to set up
*
* If this module is not disabled (by setting app.config.ssl.enabled=false) it will raise an error with instructions on how to init the certificate command
*
* Required Files:
* 1. SSL Certificate file in `units/ssl/cert/fullchain.pem`
* 2. Private key file in `units/ssl/cert/privkey.pem`
*
* @date 2017-03-29
* @author Matt Carter <m@ttcarter.com>, Jake Skoric <jake@mfdc.biz>
* @param {boolean} [app.config.ssl.enabled=false] Whether this module should be active
* @param {number} [app.config.ssl.port=443] The port number this module should listen on for a HTTPS connection
* @param {boolean} [app.config.ssl.redirect=false] Whether to force all HTTP traffic to be HTTPs - if enabled all incomming requests are rewritten as HTTPS 302 redirects
*/

var _ = require('lodash');
var async = require('async-chainable');
var colors = require('chalk');
var express = require('express');
var fs = require('fs');
var http = require('http');
var https = require('https');
var url = require('url');

app.register('preHTTPServer', function(finish) {
	// If SSL enabled + redirect enabled, create basic server to redirect to HTTPS server
	if (app.config.ssl.enabled && app.config.ssl.redirect) {
		var redirectApp = express();
		redirectApp.get('/*', function(req, res) {
			res.redirect('https://' + url.parse(app.config.url).hostname + req.url); // Force HTTPS protocol, irrespective of specified protocol in app.config.url
		});
		global.app.server = http.createServer(redirectApp).listen(app.config.port);
	}

	finish();
});

app.register('postServer', function(finish) {
	if (!app.config.ssl.enabled) return finish();

	async()
		// Read in the certs {{{
		.parallel({
			cert: function(next) {
				var path = app.config.ssl.cert || __dirname + '/cert/fullchain.pem';
				fs.readFile(path, function(err, content) {
					if (err) return next('No SSL certificate (' + path + ')');
					next(null, content);
				})
			},
			key: function(next) {
				var path = app.config.ssl.key || __dirname + '/cert/privkey.pem';
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
			}, app).listen(app.config.ssl.port, next);
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

app.register('postFinish', function(finish) {
	if (!app.config.ssl.enabled) return finish();

	var parsedURL = url.parse(app.config.url);
	parsedURL.host = undefined; // Force this to rebuild
	parsedURL.port = app.config.ssl.port;
	parsedURL.protocol = 'https:';
	parsedURL = url.format(parsedURL);

	console.log('Web HTTPS interface listening at', colors.cyan(_.trimEnd(parsedURL, '/')));
	finish();
});
