/**
* Instance service
* This service determines the 'instance' we are running as which usually corresponds to a subdomain
* It uses the app.config.instances.domain specification to do this so you have to update this for production sites
* If an instance is active $config.instances.name is populated
*/

angular
	.module('app')
	.run(function($rootScope, $config, $location) {
		if ($config.instances.enabled) {
			var mainDomain = new RegExp($config.instances.domain + '$');
			if (!mainDomain.test($location.host())) return console.error('Cannot determine instance domain. Configured main domain is "' + $config.instances.domain + '" but $location.host() returns "' + $location.host() + '" - change config/index.conf.js +/instances: if this is incorrect');

			var instanceName = $location.host().replace(mainDomain, '').replace(/\.$/, '');
			if (instanceName) $config.instances.name = instanceName;
			if ($location.port()) $config.instances.port = $location.port();
		}
	});
