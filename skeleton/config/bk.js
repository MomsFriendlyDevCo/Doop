const _ = require('lodash');
module.exports = _.defaultsDeep(
	{
		port: process.env.PORT || 8080,
	},
	require('./dev'),
);
