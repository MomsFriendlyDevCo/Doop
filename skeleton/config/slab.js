const _ = require('lodash');
module.exports = _.defaultsDeep(
	{
		port: process.env.PORT || 80,
		url: 'http://slab',
		email: {
			enabled: true,
		},
		projects: {
			harbourPark: {
				baseUrl: 'https://1979-103-96-6-111.au.ngrok.io',
			},
		},
		gulp: {
			//watchModulesInclude: [
			//	'/home/mc/Papers/Projects/Node/@momsfriendlydevco/macgyver/dist/macgyver.js',
			//],
		},
		subdomains: {
			baseHost: 'slab',
		},
	},
	require('./dev'),
);
