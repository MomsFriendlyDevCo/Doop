/**
* Simple user display widget
* NOTE: This is a bind-once widget, any changes to the user object will NOT be updated
* @param {Object|string} user The user to display. If this is an object it will be used as is and should contain the below. If its a string its assumed to be the user ID and a server query will be done to fetch the user information.
* @param {string} [user.email] The users email address
* @param {string} [user.name] The users name
* @param {boolean} [name=false] Display the users name next to the avatar
*/
angular
	.module('app')
	.component('user', {
		bindings: {
			user: '<',
			name: '<',
		},
		controller: function($element, $scope, $session, Users) {
			var $ctrl = this;
			$ctrl.$session = $session;

			$ctrl.userObject;
			$scope.$watch('$ctrl.user', ()=> {
				if (!$ctrl.user) {
					return; // Not yet loaded
				} else if (angular.isObject($ctrl.user)) {
					$ctrl.userObject = $ctrl.user;
				} else if (angular.isString($ctrl.user)) {
					Users.get({id: $ctrl.user, select: 'email,name'}).$promise
						.then(data => $ctrl.userObject = data);
				}
			});

			// Popover {{{
			$ctrl.popover = {
				enabled: false,
				top: 0,
				left: 0,
				height: 200,
				width: 250,
			};

			$element
				.on('mouseover', ()=> $scope.$apply(()=> {
					$ctrl.popover.enabled = true;
					var pos = $($element).offset();
					$ctrl.popover.top = pos.top - ($ctrl.popover.height + 30);
					$ctrl.popover.left = pos.left - ($ctrl.popover.width / 2) + 20;
				}))
				.on('mouseleave', ()=> $scope.$apply(()=> $ctrl.popover.enabled = false))

			// Hide the popover if the user starts scrolling again
			var scrollHider = ()=> $scope.$apply(()=> $ctrl.popover.enabled = false); // We need to store this in a function ref so we can detach when this directive gets destroyed
			angular.element('#content').on('scroll', scrollHider);
			$scope.$on('$destroy', ()=> angular.element('#content').off('scroll', scrollHider));
			// }}}
		},
		template: `
			<i ng-if="!$ctrl.userObject._id" class="fa fa-spinner fa-spin fa-2x"></i>
			<a ng-if="$ctrl.userObject._id" ng-href="{{$ctrl.$session.data.permissions.users ? '#/admin/users/' + $ctrl.userObject._id : undefined}}" class="media">
				<div ng-if="$ctrl.popover.enabled" class="popover top in" role="tooltip" style="position: fixed; top: {{$ctrl.popover.top}}px; left: {{$ctrl.popover.left}}px; display: block; width: {{$ctrl.popover.width}}px; height: {{$ctrl.popover.height}}px">
					<div class="arrow" style="left: 50.2538%;"></div>
					<h3 class="popover-title" style="display: none;"></h3>
					<div class="popover-content text-black">
						<div class="text-center">
							<div style="display: block; width: 120px; height: 120px; margin: 0 auto">
								<img gravatar-src-once="::$ctrl.userObject.email" gravatar-size="120" gravatar-default="monsterid" class="img-circle img-user media-object">
							</div>
							<div class="m-t-20">
								<strong>
									{{::$ctrl.userObject.name}}
								</strong>
							</div>
							<div class="m-t-5">
								{{::$ctrl.userObject.email}}
							</div>
						</div>
					</div>
				</div>
				<div class="media-left">
					<img gravatar-src-once="$ctrl.userObject.email" gravatar-size="40" gravatar-default="monsterid" class="img-circle img-user media-object"/>
				</div>
				<div ng-if="::$ctrl.name" class="media-body">
					<div class="media-right p-t-5">
						{{::$ctrl.userObject.name}}
					</div>
				</div>
			</a>
		`,
	});
