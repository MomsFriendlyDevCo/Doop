// MC's development rig
module.exports = {
	port: process.env.PORT || 80,
	url: 'http://slab',
	access: {
		lockdown: false,
	},
	gulp: {
		notifications: true,
		npmUpdate: false,
	},
	instances: {
		domain: 'slab',
	},
};
