/**
* Extremely simple component which fetches a single point of data from the server and displays it
* EITHER the collection + ID OR the url must be specified
* If the return value from the server is an array the first item in the array is assumed to be the one we're interested in
* @param {string} [collection] The collection to fetch (usually maps with the backend collection name)
* @param {string} [id] The ID of the collection instance to fetch data on
* @param {string} [url] The URL to fetch data from (instead of specifying `collection` + `id`)
* @param {string} [key='title'] The field to fetch and display
* @param {string} [format='auto'] How to format the output. `auto` = try and figure it out from the server data format, `none` = don't do anything, `number` = format via the 'number' filter,
* @param {boolean} [lazy=true] If true, fetching will be defered until the element is actually shown within the content area
* @param {string} [lazyParents='#content,body'] jQuery compatible string listing the intersection parents to probe for when lazy==true, the first one found is assumed to be the parent
* @param {string} [lazyDisable='.modal'] jQuery compatible string which, if matched disables lazy loading (defaults to inside modals by default)
* @param {string} [classValid] Apply this class to the element if the returned value is truthy
* @param {string} [classInvalid] Apply this class to the element if the return value is falsy
* @param {boolean} [ignoreErrors=false] Ignore all thrown errors, if false they will be routed into $toast.catch
*
* @example Fetch the title of a worklot and display it when loaded
* <digest collection="worklots" id="thisItem.worklot"></digest>
*
* @example Fetch a specific URL and extract a key
* <digest url="/api/some/url" key="widgets"></digest>
*/
angular
	.module('app')
	.component('digest', {
		bindings: {
			collection: '@?',
			id: '<?',
			url: '@?',
			key: '@?',
			format: '@?',
			lazy: '@?',
			lazyParents: '@?',
			lazyDisable: '@?',
			classValid: '@?',
			classInvalid: '@?',
			ignoreErrors: '@?',
		},
		controller: function($element, $filter, $http, $scope, $timeout, $toast) {
			var $ctrl = this;

			// Data fetcher {{{
			$ctrl.loading = true;
			$ctrl.isVisible = false;
			$ctrl.value;
			$ctrl.refresh = ()=> {
				if (!$ctrl.url && !$ctrl.collection && !$ctrl.id) return; // Required data not yet ready
				if ((angular.isUndefined($ctrl.lazy) || $ctrl.lazy) && !$ctrl.isVisible) return; // Don't bother to fetch if we're not actually visible

				$ctrl.loading = true;
				$http.get($ctrl.url || `/api/${$ctrl.collection}/${$ctrl.id}`, {
					select: $ctrl.key || 'title',
				})
					.then(res => {
						var val =
							angular.isArray(res.data) ? _.get(res.data, [0, $ctrl.key]) // Is an array? Assume we mean't the first object element
							: angular.isObject(res.data) ? res.data[$ctrl.key || 'title'] // Is an object? Look for the key directly
							: undefined; // Everything else - no idea

						// Try and determine the format to use if format==auto {{{
						if (!$ctrl.format || $ctrl.format == 'auto') {
							$ctrl.format = angular.isNumber(val) ? 'number' : 'none';
						}
						// }}}

						// Apply formatting {{{
						switch ($ctrl.format) {
							case 'none':
								$ctrl.value = val;
								break;
							case 'number':
								$ctrl.value = $filter('number')(val);
								break;
							default:
								console.warn('Unknown digest format:', $ctrl.format);
								$ctrl.value = val;
						}
						// }}}
					}, err => {
						if (!$ctrl.ignoreErrors) $toast.catch(err);
					})
					// Apply classing {{{
					.then(()=> {
						$element
							.removeClass($ctrl.classValid)
							.removeClass($ctrl.classInvalid)
							.addClass($ctrl.value ? $ctrl.classValid : $ctrl.classInvalid)
					})
					// }}}
					.catch($toast.catch)
					.finally(()=> $ctrl.loading = false)
			};
			// }}}

			// Check we can use Lazy observing
			if (angular.element($element).parents($ctrl.lazyDisable).length) $ctrl.lazy = false;

			// Bind an interesection observer to fire a callback when the element appears on screen {{{
			if (angular.isUndefined($ctrl.lazy) || $ctrl.lazy) {
				$ctrl.intersectionObserver = new IntersectionObserver(data => $timeout(()=> {
					if (data[0].intersectionRatio > 0) $ctrl.isVisible = true;
				}), {
					root: angular.element($ctrl.lazyParents || '#content,body')[0],
					rootMargin: '100px',
					threshold: 0.1,
				});
				$ctrl.intersectionObserver.observe($element[0]);
			}
			// }}}

			$scope.$watchGroup(['$ctrl.collection', '$ctrl.id', '$ctrl.url', '$ctrl.key', '$ctrl.isVisible'], ()=> $ctrl.refresh());
		},
		template: `
			<i ng-if="$ctrl.loading" class="fa fa-spinner fa-spin"></i>
			<span ng-if="!$ctrl.loading" ng-bind="$ctrl.value"></span>
		`,
	});
