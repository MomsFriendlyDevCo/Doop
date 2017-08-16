/**
* Fire a $rootScope.$broadcast() with the given message when an ng-repeat render finishes
* @param {string} message The message to broadcast to $rootScope
* @example
* <div ng-repeat="widget in widgets" ng-repeat-broadcast="finished"></div>
*/
angular
	.module('app')
	.directive('ngRepeatBroadcast', function($timeout, $rootScope) {
		return {
			restrict: 'A',
			link: function (scope, elem, attr) {
				if (scope.$last === true)
					$timeout(()=> $rootScope.$emit(attr.ngRepeatBroadcast));
			},
		};
	})
