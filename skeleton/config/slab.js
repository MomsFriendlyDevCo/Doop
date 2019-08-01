// MC's development rig
module.exports = {
	port: process.env.PORT || 80,
	url: 'http://slab',
	access: {
		lockdown: false,
	},
	email: {
		enabled: true,
		method: 'mailgun',
		toAdmin: 'matt@mfdc.biz',
	},
	gulp: {
		notifications: true,
		npmUpdate: false,
		watchModules: true,
		watchModulesInclude: [],
		watchVendors: true,
	},
};
