var monoxide = require('monoxide');

app.use('/api/users/:id?', monoxide.express.middleware('users', {
	query: app.middleware.ensure.admin,
	create: app.middleware.ensure.admin,
	save: app.middleware.ensure.admin,
	get: app.middleware.ensure.login,
	delete: app.middleware.ensure.admin,
	meta: app.middleware.ensure.admin,
}));
