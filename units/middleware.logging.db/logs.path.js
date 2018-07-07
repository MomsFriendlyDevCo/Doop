var _ = require('lodash');
var async = require('async-chainable');
var fs = require('fs');
var humanize = require('humanize');
var mkdirp = require('mkdirp');
var monoxide = require('monoxide');


/**
* Return the contents of a db.logs query in a format compatible with angular-ui-history
* @param {string} req.params.model The database model to query
* @param {string} req.params.id The ID of the enity to query
* @param {array|string} [req.query.type] Filter by a given type or types
* @param {array|string} [req.query.tags] Filter by an array of tags
* @param {boolean} [req.query.noTags] Include items without a tag
* @param {number} [req.query.skip] Skip the given number of records
* @param {number} [req.query.limit] Limit data to the given number of records
* @param {string} [req.query.sort='created'] How to sort the data
* @return {array} An array of changes in the form of an angular-ui-history feed
*/
app.get('/api/logs/:model/:id', app.middleware.ensure.login, function(req, res) {
	async()
		// Sanity checks {{{
		.then(function(next) {
			if (req.query.type && !_.isArray(req.query.type)) req.query.type = _.castArray(req.query.type);
			if (req.query.tags && !_.isArray(req.query.tags)) req.query.tags = _.castArray(req.query.tags);

			next();
		})
		// }}}
		// Fetch data {{{
		.then('logs', function(next) {
			db.logs
				.find({ // Mandatory query to filter by
					model: req.params.model,
					docId: req.params.id,
				})
				.limit(req.query.limit || undefined)
				.skip(req.query.skip || 0)
				.sort(req.query.sort || 'created')
				.exec(next);
		})
		// }}}
		// Filter logs {{{
		.then('logs', function(next) {
			next(null,
				this.logs.filter(l =>
					(!req.query.type || req.query.type.includes(l.type)) // Match type
					&& ( // Match tags or noTags
						!req.query.tags
						|| l.tags.some(tag => req.query.tags.includes(tag))
						|| (req.query.noTags && (!l.tags || !l.tags.length))
					)
				)
			);
		})
		// }}}
		// Fetch all required users {{{
		.then('users', function(next) {
			db.users.find({_id: {$in: _(this.logs).map('user').uniq().value()}})
				.select(['_id', 'company', 'name', 'permissions', 'email'])
				.populate('company')
				.exec(function(err, res) {
					if (err) return next(err);
					// Map users into an object lookup
					next(null, _.mapKeys(res, u => u._id));
				});
		})
		// }}}
		// Map data into a form we can use {{{
		.map('logs', 'logs', function(next, log, index) {
			var post = {
				_id: `history-${index}`,
				date: log.created,
			};

			// Attach user info if we have one
			if (log.user && this.users[log.user]) {
				post.user = {
					name: this.users[log.user].name,
					email: this.users[log.user].email,
					url: `#/users/${this.users[log.user]._id}`,
					isIC: _.get(this.users[log.user], 'company.type') == 'independentCertifier',
					isQC: _.get(this.users[log.user], 'permissions.qualityCoordinator'),
				};
			}

			switch (log.type) {
				case 'create':
					next(null, {
						type: (log.user ? 'user' : 'system') + '.status',
						title: 'Created record',
					});
					break;
				case 'save':
					if (_.keys(log.changes).length == 0) {
						next(); // Filter post later
					} else if (_.keys(log.changes).length == 1) { // Only one change
						var change = log.changes[_.keys(log.changes)[0]];
						post.type = (log.user ? 'user' : 'system') + '.change';
						post.field = _.keys(log.changes)[0];
						post.from = change[1];
						post.to =change[0];
						next(null, post);
					} else { // Many changes
						post.type = (log.user ? 'user' : 'system') + '.change';
						post.fields = _.mapValues(log.changes, (v, k) => ({from: v[1], to: v[0]}));
						next(null, post);
					}
					break;
				case 'user-validated':
					post.type = 'user.status';
					post.title = 'User validated their email address';
					next(null, post);
					break;
				case 'user-comment':
					post.type = 'user.comment';
					post.body = log.content;
					next(null, post);
					break;
				case 'user-emailed':
					post.type = 'user.status';
					post.body = log.content;
					next(null, post);
					break;
				case 'user-upload':
					post.type = 'user.upload';
					post.files = log.payload.map(f => ({
						filename: f.filename,
						url: f.url,
						size: humanize.filesize(f.size),
						icon:
							// Very abridged list of mimetypes -> font-awesome lookup {{{
							/^audio\//.test(f.mimetype) ? 'fa fa-file-audio' :
							/^image\//.test(f.mimetype) ? 'fa fa-file-image' :
							/^text\//.test(f.mimetype) ? 'fa fa-file-alt-o' :
							/^video\//.test(f.mimetype) ? 'fa fa-file-video' :
							f.mimetype == 'application/vnd.ms-excel' || f.mimetype == 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' || f.mimetype == 'application/vnd.openxmlformats-officedocument.spreadsheetml.template' ? 'fa fa-file-excel' :
							f.mimetype == 'application/msword' || f.mimetype == 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' || f.mimetype == 'application/vnd.openxmlformats-officedocument.wordprocessingml.template' ? 'fa fa-file-word' :
							f.mimetype == 'application/vnd.ms-powerpoint' || f.mimetype == 'application/vnd.openxmlformats-officedocument.presentationml.presentation' || f.mimetype == 'application/vnd.openxmlformats-officedocument.presentationml.slideshow' || f.mimetype == 'application/vnd.openxmlformats-officedocument.presentationml.template' ? 'fa fa-file-word' :
							f.mimetype == 'application/pdf' ? 'fa fa-file-pdf' :
							f.mimetype == 'application/zip' || f.mimetype == 'application/x-compressed-zip' || f.mimetype == 'application/x-tar' || f.mimetype == 'application/x-bzip2' ? 'fa fa-file-archive' :
							'fa fa-file',
							// }}}
					}));
					next(null, post);
					break;
				default:
					console.log(colors.blue('[Logging]'), 'Unknown log type', colors.cyan(log.type), 'Add this into units/middleware.logging.db/logs.path.js');
					next();
			}
		})
		// }}}
		// Sort {{{
		.then('logs', function(next) {
			if (!req.query.sort || req.query.sort == 'created') {
				req.query.sort = 'date';
			} else if (req.query.sort == '-created') {
				req.query.sort = '-date';
			}

			var sortReverse = false;
			if (req.query.sort.startsWith == '-') {
				req.query.sort = req.query.sort.substr(1);
				sortReverse = true;
			}

			this.logs = _.sortBy(this.logs, req.query.sort);
			if (sortReverse) _.reverse(this.logs);

			next(null, this.logs);
		})
		// }}}
		// End {{{
		.end(function(err) {
			if (err) return res.sendError(err);
			res.send(this.logs);
		});
		// }}}
});


/**
* Sweep and return all tags used in all available posts for a discussion
* This returns the unique contents of logs.tags[]
* @param {string} req.params.model The database model to query
* @param {string} req.params.id The ID of the enity to query
* @return {array} An array of tags found
*/
app.get('/api/logs/:modal/:id/tags', app.middleware.ensure.login, function(req, res) {
	async()
		// Fetch data {{{
		.then('logs', function(next) {
			db.logs
				.find({
					model: req.params.model,
					docId: req.params.id,
				})
				.select('tags')
				.exec(next);
		})
		// }}}
		// Extract tags {{{
		.then('tags', function(next) {
			next(null,
				_(this.logs)
					.map(l => l.tags)
					.flatten()
					.sort()
					.uniq()
					.value()
			);
		})
		// }}}
		// End {{{
		.end(function(err) {
			if (err) return res.sendError(err);
			res.send(this.tags);
		});
		// }}}
});


/**
* Post a manually created user comment
* @param {string} req.params.model The database model to use
* @param {string} req.params.id The ID of the enity to use
* @param {string} req.body.body The HTML body of the comment to post
* @return {void} Whether the posting succeded
*/
app.post('/api/logs/:model/:id', app.middleware.ensure.login, app.middleware.uploads.any(), function(req, res) {
	async()
		// Sanity checks {{{
		.then(function(next) {
			if (!req.body.body && !req.files) return next('No content provided');
			next();
		})
		// }}}
		// Accept file uploads {{{
		.then('uploadPath', function(next) {
			if (!req.files) return next();
			next(null, `${app.config.paths.root}/data/logs/` + req.url.split('/').slice(3).join('/'));
		})
		.then(function(next) {
			if (!this.uploadPath) return next();
			mkdirp(this.uploadPath, next);
		})
		.forEach(req.files || [], function(next, file) {
			fs.rename(file.path, `${this.uploadPath}/${file.originalname}`, next);
		})
		.then(function(next) {
			if (!this.uploadPath) return next();
			db.logs.create({
				user: req.user._id,
				type: 'user-upload',
				model: req.params.model,
				docId: req.params.id,
				payload: req.files.map(f => ({
					filename: f.originalname,
					size: f.size,
					url: `/api/logs/${req.params.model}/${req.params.id}/file/${f.originalname}`,
				})),
			}, next)
		})
		// }}}
		// Create log entry {{{
		.then(function(next) {
			if (!req.body.body) return next();
			db.logs.create({
				user: req.user._id,
				type: 'user-comment',
				model: req.params.model,
				docId: req.params.id,
				content: req.body.body,
			}, next)
		})
		// }}}
		// End {{{
		.end(function(err) {
			if (err) return res.sendError(err);
			res.send({});
		});
		// }}}
});


/**
* Serve up a file uploaded via /api/logs/:model/:id
*/
app.get('/api/logs/:model/:id/file/:file', app.middleware.ensure.login, function(req, res) {
	async()
		// Figure out the absolute path {{{
		.then('path', function(next) {
			next(null, `${app.config.paths.root}/data/logs/${req.params.model}/${req.params.id}/${req.params.file}`);
		})
		// }}}
		// Fetch stats to check the file actually exists {{{
		.then('stats', function(next) {
			console.log('STAT', this.path);
			fs.stat(this.path, function(err, stats) {
				if (err) return next('File not found');
				next(null, stats);
			});
		})
		// }}}
		// End {{{
		.end(function(err) {
			if (err) return res.sendError(err);
			res.sendFile(this.path);
		})
		// }}}
});

app.use('/api/logs/:id?', monoxide.express.middleware('logs', {
	get: app.middleware.ensure.login,
	query: app.middleware.ensure.login,
	count: app.middleware.ensure.login,
	create: false,
	save: false,
	delete: false,
	meta: app.middleware.ensure.login,
}));
