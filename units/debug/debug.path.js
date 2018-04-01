var _ = require('lodash');
var async = require('async-chainable');
var hashedReleaseName = require('hashed-release-name');
var email = require('mfdc-email');
var fs = require('fs');
var os = require('os');
var spawn = require('child_process').spawn;

/**
* Test email sending
* This dispatches the '/units/emails/debug.tmpl.txt' email to the email address stored in app.config.email.from
*/
app.get('/api/debug/test/email', app.middleware.ensure.login, function(req, res) {
	email()
		.to(app.config.email.from)
		.subject('Debug Email')
		.template(app.config.paths.root + '/units/email/debug.email.txt')
		.templateParams({
			config: app.config,
		})
		.send(function(err, emailRes) {
			res.send({
				error: err,
				response: emailRes,
			});
		})
});


/**
* Fetch Git information
* NOTE: This will only execute ONCE per execution cycle to prevent DDOS
*/
var _cachedVersion;
app.get('/api/debug/version', function(req, res) {
	if (_cachedVersion) return res.send(_cachedVersion);

	async()
		.parallel({
			git: function(next) {
				async()
					.then('gitHistoryRaw', function(next) {
						var buffer = '';
						var proc = spawn('git', ['log', '--pretty=format:%H|%h|%cI|%cn|%s'], {cwd: app.config.paths.root});
						proc.stdout.on('data', data => buffer += data.toString());
						proc.on('close', ()=> next(null, buffer.split(/\n/g)));
					})
					.then('git', function(next) {
						next(null, this.gitHistoryRaw
							.slice(0, 30)
							.map(line => {
								var gitInfo = line.split('|');
								return {
									release: hashedReleaseName({
										alliterative: true,
										hash: gitInfo[0],
										transformer: phrase => _.startCase(phrase),
									}),
									hash: gitInfo[0],
									shortHash: gitInfo[1],
									date: gitInfo[2],
									committer: gitInfo[3],
									subject: gitInfo[4],
								};
							})
						);
					})
					.end(function(err) {
						if (err) return next(err);
						next(null, this.git);
					});
			},
			package: function(next) {
				var packagePath = app.config.paths.root + '/package.json';
				fs.stat(packagePath, function(err, stat) {
					if (err) return next(err);
					next(null, {
						version: require(packagePath).version,
						updated: stat.mtime,
					});
				});
			},
		})
		.end(function(err) {
			if (err) return res.sendError(err);
			_cachedVersion = {
				package: this.package,
				gitHistory: this.git,
			};
			res.send(_cachedVersion);
		});
});


/**
* Server live data
*/
app.get('/api/debug/live', app.middleware.ensure.login, function(req, res) {
	res.send({
		epoch: Date.now(),
		freemem: os.freemem(),
		totalmem: os.totalmem(),
		uptime: os.uptime(),
		load: os.loadavg(),
	});
});


/**
* Debugger for the pending UI
* This controller will return a 404 until the 25th attempt
*/
app.get('/debug/pending', function(req, res) {
	if (req.query.pendingTry == 25) {
		res.send({foo: 'bar'});
	} else {
		res.status(404).end();
	}
});

app.all('/api/debug/200', function(req, res) {
	res.send('Everything is ok, relax');
});

app.all('/api/debug/403', function(req, res) {
	res.status(403).send('You are forbidden from doing that. Forbidden I say!');
});

app.all('/api/debug/500', function(req, res) {
	throw new Error('Intentional test error');
});
