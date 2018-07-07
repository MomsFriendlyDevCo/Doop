/**
* Directive to display a <select/> compatible control but with lazy-loaded ajax content
*
* @param {boolean} [clearable=true] Whether the directive should support clearing the value
* @param {boolean} [multiple=false] Whether to allow multiple elements to be selected, the binding will be an array (of whatever is in `want`) if this is true
* @param {string} [ngModel] The item to bind to. The exact nature of what this gets is dictated by `want`
* @param {string} url Angular templatable string to where to fetch a collection of data from
* @param {function} [onSelect] Function to call when an item has been selected. Called as ({title, id})
* @param {string} [want="id"] How to set the value of ngModel. ENUM: 'id' (the ID of the selected item), 'object' (the entire selected object including {id, title})
*
* @example Display dropdown entity
* <select-from url="/api/dropdowns/byName/designPackage"></select-from>
*/
angular
	.module('app')
	.component('selectFrom', {
		bindings: {
			ngModel: '=?',
			onSelect: '&?',
			multiple: '<?',
			url: '@?',
			want: '@?',
		},
		controller: function($element, $http, $loader, $prompt, $q, $scope, $timeout, $toast) {
			var $ctrl = this;

			$ctrl.selected; // Object the user has selected (expected to have {id,title}
			$ctrl.searchString = ''; // What the user is searching for, when something is selected this inherits the $ctrl.selected.title

			$ctrl.options; // Available options - lazy loaded from the URL when needed
			$ctrl.optionsFiltered = $ctrl.options; // Filtered version of $ctrl.options when being searched

			// .refresh() - data refresher() {{{
			$ctrl.isLoading = false;
			$ctrl.isLoaded = false; // Whether we have run $ctrl.refresh() at least once
			$ctrl.refresh = (force = false)=> {
				if (!force && $ctrl.isLoaded) return $q.resolve(); // Already loaded data

				return $q.resolve()
					.then(()=> $ctrl.isLoading = true)
					.then(()=> $ctrl.isLoaded = true)
					.then(()=> $loader.startBackground($scope.$id))
					.then(()=> {
						if (!$ctrl.url) throw new Error('No URL to resolve when refreshing selectFrom directive');
					})
					.then(()=> $http.get($ctrl.url))
					.then(res => res.data)
					// Convert data if needed {{{
					.then(data => {
						if (data.options) { // Dropdown format
							return data.options.map(o => ({
								title: o.description,
								id: o.dropdownId || o.description,
							}));
						} else if (!angular.isArray(data) || data.some(d => d.title && d.id)) {
							throw new Error('Unknown data format returned when using selectFrom directive!');
						} else {
							return data;
						}
					})
					// }}}
					.then(data => $ctrl.optionsFiltered = $ctrl.options = data)
					// Convert $ctrl.selected from a scalar into an object {{{
					.then(()=> {
						if (!angular.isObject($ctrl.selected)) {
							$ctrl.selected = $ctrl.options.find(o => o.id == $ctrl.selected);
						}
					})
					// }}}
					.catch($toast.catch)
					.finally(()=> $ctrl.isLoading = false)
					.finally(()=> $loader.stop($scope.$id))
			};
			// }}}

			// .openDropdown() - deal with the dropdown loading + interaction {{{
			$ctrl.isDropdownOpen = false;
			$ctrl.openDropdown = ()=>
				$ctrl.refresh()
					.then(()=> $ctrl.isDropdownOpen = true)
					.then(()=> $ctrl.searchString = '')
					.then(()=> $ctrl.search())
					.then(()=> $q(resolve => $timeout(()=> resolve(), 100))) // Let Angular render everything
					.then(()=> $prompt.dropdown({
						dropdown: $element.find('.dropdown-menu'),
						element: $element.find('input[type=text]'),
						marginTop: 10,
					}))
					.then(()=> {
						if (angular.isFunction($ctrl.onSelect)) $ctrl.onSelect($ctrl.selected);
					})
					.finally(()=> $ctrl.isDropdownOpen = false)
			// }}}

			// .search() - filter down the dropdown contents {{{
			$ctrl.search = ()=> {
				if ($ctrl.searchString) {
					var searchRE = new RegExp($ctrl.searchString.replace(/[|\\{}()[\]^$+*?.]/g, '\\$&'), 'i');
					$ctrl.optionsFiltered = $ctrl.options.filter(o => searchRE.test(o.title));
				} else {
					$ctrl.optionsFiltered = $ctrl.options;
				}
			};
			// }}}

			// .setSelected() - actually select things {{{
			$ctrl.setSelected = item => {
				if (!$ctrl.multiple) { // Single item selection
					$ctrl.selected = item;
					$ctrl.searchString = $ctrl.selected ? $ctrl.selected.title : '';

					if ($ctrl.selected) {
						if (angular.isUndefined($ctrl.want) || $ctrl.want == 'id') {
							$ctrl.ngModel = $ctrl.selected.id;
						} else if ($ctrl.want == 'object') {
							$ctrl.ngModel = $ctrl.selected;
						} else {
							throw new Error('Unknown `want` value for selectFrom directive');
						}
					} else {
						$ctrl.ngModel = undefined;
					}
				} else {
					if (item) {
						item.selected = ! item.selected;
						$ctrl.selected = $ctrl.options.filter(i => i.selected);
					} else { // Assume we meant to clear instead
						$ctrl.options.forEach(i => i.selected = false);
						$ctrl.selected = [];
					}

					$ctrl.searchString = '';
					$ctrl.searchPlaceholder = $ctrl.selected.map(i => i.title).join(', ');

					if ($ctrl.selected.length) {
						if (angular.isUndefined($ctrl.want) || $ctrl.want == 'id') {
							$ctrl.ngModel = $ctrl.selected.map(i => i.id);
						} else if ($ctrl.want == 'object') {
							$ctrl.ngModel = $ctrl.selected;
						} else {
							throw new Error('Unknown `want` value for selectFrom directive');
						}
					} else {
						$ctrl.ngModel = [];
					}
				}
			};
			// }}}

			// Watch: $ctrl.ngModel - incomming data {{{
			$scope.$watch('$ctrl.ngModel', ()=> {
				$ctrl.searchString = angular.isObject($ctrl.ngModel)
					? $ctrl.ngModel.title
					: $ctrl.ngModel
			});
			// }}}
		},
		template: `
			<div class="btn-group" ng-class="$ctrl.isLoading ? 'loading' : ''">
				<a ng-click="$ctrl.openDropdown()" class="btn btn-default">
					<input type="text" ng-model="$ctrl.searchString" placeholder="{{$ctrl.searchPlaceholder}}" ng-change="$ctrl.search()"/>
					<button ng-click="$event.stopPropagation(); $ctrl.setSelected()" class="clear" ng-show="$ctrl.searchString" tooltip="Clear selection"></button>
				</a>
				<ul ng-if="$ctrl.isDropdownOpen" class="dropdown-menu">
					<li ng-if="$ctrl.clearable === undefined || $ctrl.clearable">
						<a ng-click="$ctrl.setSelected()">
							<em>Clear selection</em>
						</a>
					</li>
					<li ng-if="!$ctrl.multiple" ng-repeat="option in $ctrl.optionsFiltered track by option.id">
						<a ng-click="$ctrl.setSelected(option)" ng-bind="option.title"></a>
					</li>
					<li ng-if="$ctrl.multiple" ng-repeat="option in $ctrl.optionsFiltered track by option.id">
						<a ng-click="$ctrl.setSelected(option); $event.stopPropagation()">
							<i ng-class="option.selected ? 'far fa-fw fa-lg fa-check-square' : 'far fa-fw fa-lg fa-square'"></i>
							{{option.title}}
						</a>
					</li>
				</ul>
			</div>
		`,
	});
