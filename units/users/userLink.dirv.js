/**
* Generic widget to display a users details inline
* This avoids having to do 'does the user have an email' tests each time we want to show a name
*
* @example
* <user-link user="someUser"></user-link>
*/
angular
	.module('app')
	.component('userLink', {
		bindings: {
			user: '=',
		},
		template: `
			<a href="#/users/{{$ctrl.user._id}}" class="badge badge-info">
				<i class="fa" ng-class="{'fa-user-circle': $ctrl.user.role == 'admin' || $ctrl.user.role == 'owner', 'fa-user': $ctrl.user.role == 'staff', 'fa-user-o': $ctrl.user.role == 'client'}"></i>
				{{$ctrl.user.name}}
				<span ng-if="$ctrl.user.email">({{$ctrl.user.email}})</span>
			</a>
		`,
	})
