angular
	.module('app')
	.component('sessionHeaderWidget', {
		controller: function($session) {
			var $ctrl = this;
			$ctrl.$session = $session;
		},
		template: `
			<li class="pull-right dropdown">
				<a data-toggle="dropdown" class="dropdown-toggle">
					<div class="username">{{$ctrl.$session.data.name}}</div>
					<img gravatar-src="$ctrl.$session.data.email" gravatar-size="40" gravatar-default="monsterid" class="img-circle img-user media-object">
				</a>
				<ul class="dropdown-menu pull-right">
					<li><a href="#/profile"><i class="fa fa-user"></i> Your Profile</a></li>
					<li class="divider"></li>
					<li><a href="#/logout"><i class="fa fa-sign-out"></i> Logout</a></li>
				</ul>
			</li>
		`,
	});
