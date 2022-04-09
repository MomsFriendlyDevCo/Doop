// MC's development rig
module.exports = {
	...require('./dev'),
	port: 80,
	url: 'http://slab',
	email: {
		enabled: false,
		method: 'mailgun',
		toAdmin: 'matt@mfdc.biz',
	},
};
