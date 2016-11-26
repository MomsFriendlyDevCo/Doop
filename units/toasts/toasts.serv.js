/**
* Generic toast manager
* This service is really just a thin wrapper around Notification (ui-notification) which provides some additional functionality:
*
* Additional features:
*
* 	* Exposed as `$toast` rather than `Notification` which could be confused for a model
*	* Adds `.catch(err)` method which attempts to determine the correct error text to display
*/
angular
	.module('app')
	.config(function(NotificationProvider) {
		NotificationProvider.setOptions({
			positionX: 'right',
			positionY: 'bottom',
		});
	})
	.service('$toast', function($rootScope, Notification) {
		var $toast = this;

		$toast.primary = Notification.primary.bind(Notification);
		$toast.info = Notification.info.bind(Notification);
		$toast.success = Notification.success.bind(Notification);
		$toast.warning = Notification.warning.bind(Notification);
		$toast.error = Notification.error.bind(Notification);
		$toast.clear = Notification.clearAll.bind(Notification);

		$toast.catch = function(obj) {
			console.log('$toasts.catch', obj);
			if (_.isObject(obj) && obj.status && obj.status == -1 && obj.statusText && obj.statusText == '') return $toast.offline(true);

			$toast.error(
				_.isUndefined(obj) ? 'An error has occured' :
				_.isString(obj) ? obj :
				_.has(obj, 'error') && obj.error ? obj.error :
				_.has(obj, 'data.errmsg') && obj.data.errmsg ? obj.data.errmsg :
				_.has(obj, 'data.error') && obj.data.error ? obj.data.error :
				_.has(obj, 'statusText') && obj.statusText ? obj.statusText :
				obj.toString() ? obj.toString() :
				'An error has occured'
			);
		};

		// $toasts.offline(isOffline=true) {{{
		$toast.offlineKiller;
		$toast.offline = function(isOffline=true) {
			if (isOffline) {
				if (!$toast.offlineKiller) { // Not yet shown the message
					$toast.error({
						delay: false,
						closeOnClick: false,
						message: 'Cannot communicate with server'
					})
						.then(scope => $toast.offlineKiller = scope.kill); // Grab the toasts killer from inside the promise (when it resolves)
				}
			} else if ($toast.offlineKiller) { // No longer offline but we need to tidy up the warning
				$toast.offlineKiller();
				$toast.offlineKiller = undefined;
			}
		};
		// }}}

		$rootScope.$on('isOffline', function(e, isOffline) {
			$toast.offline(isOffline);
		});

		return $toast;
	});
