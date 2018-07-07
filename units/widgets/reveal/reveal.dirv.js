/**
* Directive to attach an intersection observer and run a function when the widget becomes available or hides
* @param {function} [reveal] The function to run when the element becomes visible on the screen. Called as ({element})
* @param {function} [revealHide] The function to run when the element becomes hidden. Called as ({element})
* @param {string} [revealParent='#content,body'] How to find the parent element, multiple queries can be seperated with commas
*/
angular
	.module('app')
	.directive('reveal', function() { return {
		scope: {
			lazyParents: '@?',
			reveal: '&?',
			revealHide: '&?',
		},
		restrict: 'AE',
		controller: function($element, $scope, $timeout) {
			$scope.isVisible;

			$scope.intersectionObserver = new IntersectionObserver(data => $timeout(()=> {
				if (data[0].intersectionRatio > 0) { // Showing
					$scope.isVisible = true;
					if (angular.isFunction($scope.reveal)) $scope.reveal({element: $element});
				} else if ($scope.isVisible === undefined) { // Hiding (for first time)
					if (angular.isFunction($scope.revealHide)) $scope.revealHide({element: $element});
					$scope.isVisible = false;
				} else {
					$scope.isVisible = false;
				}
			}), {
				root: angular.element($scope.revealParent || '#content,body')[0],
				rootMargin: '100px',
				threshold: 0.1,
			});
			$scope.intersectionObserver.observe($element[0]);
		},
	}})
