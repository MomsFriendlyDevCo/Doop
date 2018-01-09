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

		// Alias all $toast.* -> Notification.* functions
		$toast.primary = Notification.primary.bind(Notification);
		$toast.info = Notification.info.bind(Notification);
		$toast.success = Notification.success.bind(Notification);
		$toast.warning = Notification.warning.bind(Notification);
		$toast.error = Notification.error.bind(Notification);
		$toast.clear = Notification.clearAll.bind(Notification);


		/**
		* Display a brief message to indicate that something has just been saved
		*/
		$toast.save = ()=>
			Notification({
				templateUrl: 'angular-ui-notification-save.html',
				message: 'Saved',
				delay: 1000,
				type: 'success',
				positionY: 'top',
				positionX: 'right',
			});


		/**
		* Catch and display an error message from a promise
		* This funciton tries various methods to figure out what the human readable error message should actually be
		* Its designed to be used in Promise callbacks
		* @param {Object|string} obj The error object or string to display
		* @example
		* SomeComplexPromise
		* 	.then(doStuffIfEverythingIsOK)
		*	.catch($toast.catch)
		*/
		$toast.catch = function(obj) {
			console.warn('Promise chain threw error:', obj);
			if (_.isObject(obj) && obj.status && obj.status == -1 && obj.statusText && obj.statusText == '') return $toast.offline(true);
			if (obj === 'cancel') return; // Silently ignore user cancelled actions

			$toast.error(
				_.isUndefined(obj) ? 'An error has occured'
				: _.isString(obj) ? obj
				: _.has(obj, 'error') && obj.error ? obj.error
				: _.has(obj, 'data') && _.isString(obj.data) ? obj.data
				: _.has(obj, 'data.errmsg') && obj.data.errmsg ? obj.data.errmsg
				: _.has(obj, 'data.error') && obj.data.error ? obj.data.error
				: _.has(obj, 'statusText') && obj.statusText ? obj.statusText
				: _.has(obj, 'status') && obj.status === -1 ? 'Server connection failed'
				: _.has(obj, 'message') && /Received: ".+"/.test(obj.message) ? (function(text) { var matches = /^.+Received: "(.+?)"/.exec(text); return matches[1]; }(obj.message))
				: _.isFunction(obj.toString) && obj.toString() !== '[object Object]' ? obj.toString() :
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
	})
	.run(function($templateCache) {
		$templateCache.put('angular-ui-notification-save.html', `
			<div class="ui-notification ui-notification-save">
				<h3 ng-show="title" ng-bind-html="title"></h3>
				<div class="message">
					<i class="fa fa-check"></i>
					<span ng-bind-html="message"></span>
				</div>
			</div>
		`);
	})
