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
		var toasts = this;

		toasts.primary = Notification.primary.bind(Notification);
		toasts.info = Notification.info.bind(Notification);;
		toasts.success = Notification.success.bind(Notification);;
		toasts.warning = Notification.warning.bind(Notification);;
		toasts.error = Notification.error.bind(Notification);;

		toasts.catch = function(obj) {
			console.log('$toasts.catch', obj);
			if (_.isObject(obj) && obj.status && obj.status == -1 && obj.statusText && obj.statusText == '') return toasts.offline(true);

			toasts.error(
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
		toasts.offlineKiller;
		toasts.offline = function(isOffline=true) {
			if (isOffline) {
				if (!toasts.offlineKiller) { // Not yet shown the message
					toasts.error({
						delay: false,
						closeOnClick: false,
						message: 'Cannot communicate with server'
					})
						.then(scope => toasts.offlineKiller = scope.kill); // Grab the toasts killer from inside the promise (when it resolves)
				}
			} else if (toasts.offlineKiller) { // No longer offline but we need to tidy up the warning
				toasts.offlineKiller();
				toasts.offlineKiller = undefined;
			}
		};
		// }}}

		$rootScope.$on('isOffline', function(e, isOffline) {
			toasts.offline(isOffline);
		});

		return toasts;
	});
