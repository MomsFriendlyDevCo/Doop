/**
* Bind a shortcut key to trigger an event on an element
*
* @param {string} shortcut The shortcut key combo to bind to. Most formats are suppored with '+' and spaces being a seperator
* @param {string} [shortcutEvent='click'] What event to fire when the shortcut key is pressed
* @param {string} [shortcutFunction] Optional function to run instead of an event on the element. Function called as ({element, event, keyMask})
*
* @example Pressing 'S' clicks a button
* <a shortcut="s" class="btn btn-success">Save</a>
*/

// BUGFIX: This currently binds to the ASCII keycode instead of the event.key property. Issue here is that 'F5' has the same ASCII as 'T' for some reason. Needs refactoring to use the string comparitor rather than ASCII char

angular
	.module('app')
	.directive('shortcut', function(shortcut, $timeout) { return {
		scope: {
			shortcut: '@',
			shortcutEvent: '@?',
			shortcutFunction: '&?',
		},
		restrict: 'A',
		controller: function($element, $scope) {
			$scope.watchMask;
			$scope.keyWatcher = e => $timeout(()=> {
				var pressed = {
					keyCode: e.originalEvent.keyCode,
					shiftKey: e.originalEvent.shiftKey,
					ctrlKey: e.originalEvent.ctrlKey,
					metaKey: e.originalEvent.metaKey,
				};
				if (pressed.keyCode >= 65 && pressed.keyCode <= 90) pressed.keyCode += 32; // Deal with upper case Alpha characters being differnt in ASCII

				if (
					(pressed.keyCode == $scope.watchMask.keyCode || $scope.watchMask.keyCode == 'ALL')
					&& (!$scope.watchMask.ctrlKey || pressed.ctrlKey)
					&& (!$scope.watchMask.shiftKey || pressed.shiftKey)
					&& (!$scope.watchMask.metaKey || pressed.metaKey)
				) {
					console.log('Pressed', pressed, $scope.watchMask);
					e.stopPropagation();
					e.preventDefault();
					$scope.fire(e);
				}
			});

			/**
			* Actually perform whetever function we are supposed to run when the key matches
			*/
			$scope.fire = event => {
				if ($scope.shortcutEvent) { // An event is specified - run it
					$element.trigger($scope.shortcutEvent);
				} else if (angular.isFunction($scope.shortcutFunction)) {
					$scope.shortcutFunction({
						element: $element,
						keyMask: $scope.keyMask,
						event
					});
				} else { // No function, override or specific event is specified - use 'click'
					$element.trigger('click');
				}
			};

			var bindUnwatchInit = $scope.$watch('$ctrl.shortcut', ()=> {
				if (!$scope.shortcut) return;

				$scope.watchMask = shortcut.getKeyMask($scope.shortcut);
				angular.element(window).on('keydown', $scope.keyWatcher);

				bindUnwatchInit();
			});

			$scope.$on('$destroy', ()=> {
				if (!$scope.watchMask) return; // Not bound anyway
				console.log('UNBIND', $scope.keyWatcher);
				angular.element(window).off('keydown', $scope.keyWatcher);
			});
		},
	}})
