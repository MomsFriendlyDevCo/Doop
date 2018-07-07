/**
* Set Google Analytics data
*
* This requires the custom dimensions as below in the exact order:
* - instance (session scope)
* - username (user scope)
* - name (user scope)
* - company (user scope)
*
*/
angular
	.module('app')
	.run(($config, $rootScope, $session) => {
		// Update hashbang location {{{
		$rootScope.$on('$routerSuccess', ()=> {
			if (!window.ga) return;
			ga('send', 'pageview', {
				page: location.pathname + location.search  + location.hash,
			});
		});
		// }}}

		// User session dimensions {{{
		$rootScope.$on('session.updated', (e, profile) => {
			if (!window.ga) return;
			ga('set', 'dimension1', $config.projectName);

			if ($session.data._id) {
				ga('set', 'dimension2', $session.data.username);
				ga('set', 'dimension3', $session.data.name);
				ga('set', 'dimension4', $session.data.company ? $session.data.company.name : 'N/A');
			}
		});
		// }}}
	})