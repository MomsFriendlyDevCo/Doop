// Default development config
module.exports = {
	port: process.env.PORT || 8080,
	url: 'http://localhost',
	access: {
		lockdown: false,
	},
	email: {
		enabled: false,
	},
	gulp: {
		notifications: true,
		npmUpdate: false,
		watchModules: true,
		watchModulesInclude: [],
		watchVendors: true,
	},
	hmr: {
		enabled: true,
		backend: true,
		frontend: config => { // Disable hotReload frontend polling in "Roaming" power mode
			var powerMode = 'Normal';
			try {
				powerMode = fs.readFileSync('/tmp/power-mode', 'utf-8').replace(/[\s\n]+$/s, ''); // Read power mode status
			} catch {}

			return !/^Roaming/i.test(powerMode);
		},
	},
};
