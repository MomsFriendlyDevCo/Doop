/**
* Reverse mapping of the ngDisabled function
*
* @param {string} ngEnabled Expression which will be evaluated to determine if the element is enabled
*
* @example
* <input ng-enabled="$ctrl.isEnabled"/>
*/
angular
	.module('app')
	.directive('ngEnabled', function() {
		return {
			scope: {
				ngEnabled: '=',
			},
			restrict: 'A',
			controller: function($element, $scope) {
				$scope.$watch('ngEnabled', ()=> {
					if ($scope.ngEnabled) {
						$element.removeAttr('disabled');
					} else {
						$element.attr('disabled', true);
					}
				});
			},
		}
	})
