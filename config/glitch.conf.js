// MC's development rig
module.exports = {
	port: process.env.PORT || 80,
	url: 'http://glitch',
	access: {
		lockdown: false,
	},
	instances: {
		domain: 'glitch',
	},
};
