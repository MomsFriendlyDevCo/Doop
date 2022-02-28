// MC's development rig
module.exports = {
	...require('./dev'),
	url: 'http://slab',
	email: {
		enabled: false,
		method: 'mailgun',
		toAdmin: 'matt@mfdc.biz',
	},
};
