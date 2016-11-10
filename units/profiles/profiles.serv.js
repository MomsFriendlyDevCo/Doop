/**
* Profile service
* This service determines the 'profile' we are running as which usually corresponds to a subdomain
* It uses the app.config.profiles.domain specification to do this so you have to update this for production sites
*/

angular
	.module('app')
	.run(function($rootScope, $config, $location) {
		if ($config.profiles.enabled) {
			var mainDomain = new RegExp($config.profiles.domain + '$');
			if (!mainDomain.test($location.host())) return console.error('Cannot determine profile domain. Configured main domain is "' + $config.profiles.domain + '" but $location.host() returns "' + $location.host() + '" - change config/index.conf.js +/profiles: if this is incorrect');

			$config.profile = $location.host().replace(mainDomain, '') || $config.profiles.domain.default;
		}
	});
