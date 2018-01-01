/**
* Simple attribute directive to execute a function when the user presses enter within an input
*
* @param {function} ngEnter The function to execute when enter is pressed
*
* @example Run $ctrl.save() when the user presses enter within an input box
* <input ng-model="$ctrl.data" ng-enter="$ctrl.save()"/>
*/
angular
	.module('app')
	.directive('ngEnter', function() {
		return {
			scope: {
				ngEnter: '&'
			},
			restrict: 'A',
			link: function($scope, $element) {
				$element.on('keyup', e => $scope.$apply(()=> {
					if (e.which == 13) {
						$scope.ngEnter();
					}
				}));
			}
		}
	})
