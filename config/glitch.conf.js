// MC's development rig
module.exports = {
	port: process.env.PORT || 80,
	url: 'http://glitch',
	email: {
		enabled: true,
		method: 'mailgun',
		toAdmin: 'matt@mfdc.biz',
	},
	access: {
		lockdown: false,
	},
	instances: {
		domain: 'glitch',
	},
};
