var monoxide = require('monoxide');

/**
* Get a digest of the notifications for a user
* This function replaces the generic 'query' function with something that doesn't need to be reparsed on each hit at the cost of complexity
* @param {number} [req.param.status] Filter notifications by status
* @param {number} [req.param.limit=30] The limit of items to retrieve
*/
app.get('/api/notifications', app.middleware.ensure.login, function(req, res) {
	var query = {to: req.user._id};
	if (req.query.status) query.status = req.query.status;

	db.notifications
		.find(query)
		.select(['_id', 'created', 'status', 'from', 'subject', 'from'])
		.sort('-created')
		.limit(req.query.limit || 30)
		.populate('from')
		.exec(function(err, notifications) {
			if (err) return res.status(400).send({error: err.toString()});
			res.send(notifications.map(r => {
				r.from = {
					_id: r.from._id,
					name: r.from.name,
					email: r.from.email,
				};
				return r;
			}));
		});
});


/**
* Mark all of a users messages as read
*/
app.get('/api/notifications/markAsRead', app.middleware.ensure.login, function(req, res) {
	db.notifications
		.update(
			{to: req.user._id, status: 'active'},
			{status: 'read'}
		, function(err) {
			if (err) return res.status(400).send({error: err.toString()});
			res.status(200).end();
		});
});


// FIXME: Needs locking down to the current user only
app.use('/api/notifications/:id?', monoxide.express.middleware('notifications', {
	get: app.middleware.ensure.login,
	query: false, // Handled above
	count: app.middleware.ensure.login,
	create: app.middleware.ensure.login,
	save: app.middleware.ensure.login,
	delete: app.middleware.ensure.login,
}));
