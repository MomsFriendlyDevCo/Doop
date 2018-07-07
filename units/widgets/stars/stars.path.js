var _ = require('lodash');
var async = require('async-chainable');

/**
* Query the current users stars
* @return {array} The contents of req.user.stars
*/
app.get('/api/stars', app.middleware.ensure.login, function(req, res) {
	res.send(req.user.stars);
});


/**
* Get the star record for a given hashbang path
* @param {string} req.search.link The hashbang path to query
* @return {Object} An object containing `isStarred` (boolean)
*/
app.get('/api/stars/byLink', app.middleware.ensure.login, function(req, res) {
	async()
		// Sanity checks {{{
		.then(function(next) {
			if (!req.query.link) return next('Link not specified');
			next();
		})
		// }}}
		// Fetch data {{{
		.then('star', function(next) {
			next(null,
				req.user.stars.find(s => s.link == req.query.link)
			);
		})
		// }}}
		// End {{{
		.end(function(err) {
			if (err) return res.sendError(err);
			res.send({isStarred: !! this.star});
		});
		// }}}
});


/**
* Toggle a star
* @param {string} req.body.link Hashbang path of the star to toggle
* @param {string} [req.body.title] Optional page title to store
* @param {string} [req.body.breadcrumbs] Optional breadcrumb path to the page
*/
app.post('/api/stars', app.middleware.ensure.login, function(req, res) {
	async()
		// Sanity checks {{{
		.then(function(next) {
			if (!req.body.link) return next('link not specified');
			next();
		})
		// }}}
		// Toggle the star status {{{
		.then(function(next) {
			if (req.user.stars.find(s => s.link == req.body.link)) { // Toggle off
				req.user.save({
					$data: {user: req.user._id},
					stars: req.user.stars.filter(s => s.link != req.body.link),
				}, next);
			} else { // Toggle on
				req.user.save({
					$data: {user: req.user._id},
					stars: req.user.stars.concat([{
						link: req.body.link,
						title: req.body.title,
						breadcrumbs: req.body.breadcrumbs,
					}]),
				}, next);
			}
		})
		// }}}
		// End {{{
		.end(function(err) {
			if (err) return res.sendError(err);
			res.send();
		});
		// }}}
});
