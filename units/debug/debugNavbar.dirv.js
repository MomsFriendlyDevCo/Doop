angular
	.module('app')
	.component('debugNavbar', {
		controller: function($prompt, $rootScope, $scope, $session, $toast, $window, Users) {
			var $ctrl = this;

			$ctrl.profileReload = ()=>
				$session.update()
					.then(()=> $toast.success('Profile reloaded'));

			$ctrl.disguise = type => {
				$session.data.isAdmin = false;
				$session.data.isConsultant = false;
				$session.data.isContractor = false;
				$session.data.isIndependentCertifier = false;
				$session.data.isPrimaryContractor = false;
				$session.data.isSupplier = false;
				$session.data.isRoot = false;

				$session.data.isDisguised = true;

				// Reset all permissions
				$session.data.permissions = _.mapValues($session.data.permissions, ()=> false);

				switch (type) {
					case 'clear':
						$session.data.bio = 'Disguised as a blank user';
						break;
					case 'consultant':
						$session.data.isConsultant = true;
						$session.data.bio = 'Disguised as a consultant';
						break;
					case 'contractor':
						$session.data.isContractor = true;
						$session.data.bio = 'Disguised as a contractor';
						break;
					case 'independentCertifier':
						$session.data.isIndependentCertifier = true;
						$session.data.bio = 'Disguised as a independent certifier';
						break;
					case 'primaryContractor':
						$session.data.isPrimaryContractor = true;
						$session.data.bio = 'Disguised as a primary contractor';
						break;
					case 'supplier':
						$session.data.isSupplier = true;
						$session.data.bio = 'Disguised as a supplier';
						break;
					default:
						throw new Error(`Unknown disguise type: "${type}"`);
				}
				$rootScope.$broadcast('session.updated', $session.data);
				$toast.success('You are now ' + $session.data.bio.toLowerCase());
			};


			$ctrl.editPermissions = ()=> {
				Users.meta().$promise
					.then(meta => $prompt.list({
						title: 'Set permissions',
						multiple: true,
						list: _(meta)
							.pickBy((v, k) => /^permissions\./.test(k))
							.map((v, k) => k.replace(/^permissions\./, ''))
							.map(v => ({id: v, title: v}))
							.value(),
						default: _($session.data.permissions)
							.pickBy((v, k) => !!v)
							.map((v, k) => k)
							.value(),
					}))
					.then(permissions => {
						$session.data.permissions = _(permissions)
							.mapKeys(v => v)
							.mapValues(()=> true)
							.value()
					})
					.then(()=> $toast.success(`Set ${_.keys($session.data.permissions).length} permissions`))
			};


			/**
			* Redirect an absolute URL to localhost
			*/
			$ctrl.redirectToLocal = ()=> $window.location = `http://localhost:8080/${$window.location.hash}`;
		},
		template: `
			<ul class="nav navbar-top-links pull-right">
				<li id="dropdown-user" class="dropdown">
					<a data-toggle="dropdown" class="dropdown-toggle text-right">
						<div class="username hidden-xs text-primary">Admin</div>
					</a>
					<div class="dropdown-menu dropdown-menu-md dropdown-menu-right panel-default">
						<ul class="head-list">
							<li><a href="https://papertrailapp.com/events" target="_blank">Papertrail Server Logs</a></li>
							<li><a ng-click="$ctrl.redirectToLocal()">Redirect to localhost</a></li>
							<li class="divider"></li>
							<li><a ng-click="$ctrl.disguise('clear')">Clear all permissions</a></li>
							<li><a ng-click="$ctrl.disguise('consultant')">Disguise as a consultant</a></li>
							<li><a ng-click="$ctrl.disguise('contractor')">Disguise as a contractor</a></li>
							<li><a ng-click="$ctrl.disguise('independentCertifier')">Disguise as an independent certifier</a></li>
							<li><a ng-click="$ctrl.disguise('primaryContractor')">Disguise as a primary contractor</a></li>
							<li><a ng-click="$ctrl.disguise('supplier')">Disguise as a supplier</a></li>
							<li><a href="#/admin/users">Disguise as user...</a></li>
							<li class="divider"></li>
							<li><a ng-click="$ctrl.editPermissions()">Edit Permissions...</a></li>
							<li><a ng-click="$ctrl.profileReload()">Reload Profile</a></li>
						</ul>
					</div>
				</li>
			</ul>
		`,
	});
